import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import { getBackendBaseUrl } from '../config/api';

const getBaseUrl = () => getBackendBaseUrl();

const AUTH_TOKEN_KEY = '@finance_auth_token';
const AUTH_REFRESH_TOKEN_KEY = '@finance_auth_refresh_token';
const AUTH_USER_KEY = '@finance_auth_user';

export interface AuthResult {
  success: boolean;
  user?: any;
  session?: any;
  message?: string;
  error?: string;
}

export const authService = {
  /**
   * Helper to ensure the Supabase JS client is authenticated with the active session
   */
  async ensureSupabaseSession(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        return true;
      }

      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
      if (token && refreshToken) {
        const { data: sessionData, error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshToken,
        });
        if (!error && sessionData?.session?.user) {
          return true;
        }
      }
    } catch (e) {
      console.warn('ensureSupabaseSession notice:', e);
    }
    return false;
  },

  /**
   * Register a new user via backend API with automatic fallback to direct Supabase client
   */
  async signUp(email: string, password: string, fullName?: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt backend API first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${getBaseUrl()}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          full_name: fullName || 'Vault Operator',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.success) {
        if (data.session?.access_token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token);
        }
        if (data.session?.refresh_token) {
          await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.session.refresh_token);
        }
        if (data.user) {
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }

        // CRITICAL: Synchronize Supabase JS client session so RLS permits DB inserts
        if (data.session?.access_token && data.session?.refresh_token && isSupabaseConfigured()) {
          try {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
          } catch (sessionErr) {
            console.warn('Supabase setSession notice during signup:', sessionErr);
          }
        }

        return {
          success: true,
          user: data.user,
          session: data.session,
          message: data.message,
        };
      } else if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }
    } catch (networkErr) {
      console.warn('Backend API unreachable, using direct Supabase fallback:', networkErr);
    }

    // 2. Direct Supabase fallback
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName || 'Vault Operator' },
          },
        });

        if (error) {
          if (
            error.message.toLowerCase().includes('rate limit') ||
            error.message.toLowerCase().includes('already')
          ) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });
            if (!signInError && signInData?.session) {
              await AsyncStorage.setItem(AUTH_TOKEN_KEY, signInData.session.access_token);
              if (signInData.session.refresh_token) {
                await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, signInData.session.refresh_token);
              }
              if (signInData.user) {
                await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(signInData.user));
              }
              return {
                success: true,
                user: signInData.user,
                session: signInData.session,
                message: 'Vault unlocked with existing credentials.',
              };
            }
          }
          return { success: false, error: error.message };
        }

        if (data.session?.access_token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token);
        }
        if (data.session?.refresh_token) {
          await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.session.refresh_token);
        }
        if (data.user) {
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }

        return {
          success: true,
          user: data.user,
          session: data.session,
          message: data.session
            ? 'Vault initialized successfully.'
            : 'Vault initialized. Check your email for verification link.',
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed' };
      }
    }

    return {
      success: true,
      message: 'Demo vault initialized.',
    };
  },

  /**
   * Sign in an existing user via backend API with automatic fallback to direct Supabase client
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt backend API first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${getBaseUrl()}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.success) {
        if (data.session?.access_token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token);
        }
        if (data.session?.refresh_token) {
          await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.session.refresh_token);
        }
        if (data.user) {
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }

        // CRITICAL: Synchronize Supabase JS client session so RLS permits DB inserts
        if (data.session?.access_token && data.session?.refresh_token && isSupabaseConfigured()) {
          try {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
          } catch (sessionErr) {
            console.warn('Supabase setSession notice during signin:', sessionErr);
          }
        }

        return {
          success: true,
          user: data.user,
          session: data.session,
          message: data.message,
        };
      } else if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }
    } catch (networkErr) {
      console.warn('Backend API unreachable, using direct Supabase fallback:', networkErr);
    }

    // 2. Direct Supabase fallback
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          let msg = error.message;
          if (msg.toLowerCase().includes('invalid login credentials')) {
            msg = 'Invalid credentials or unconfirmed email. If you created this user before turning off email confirmation, go to Supabase Dashboard (Auth -> Users) and click "... > Confirm user", or turn off "Confirm email" in Providers -> Email.';
          }
          return { success: false, error: msg };
        }

        if (data.session?.access_token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token);
        }
        if (data.session?.refresh_token) {
          await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.session.refresh_token);
        }
        if (data.user) {
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }

        return {
          success: true,
          user: data.user,
          session: data.session,
          message: 'Welcome back.',
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Authentication failed' };
      }
    }

    return {
      success: true,
      message: 'Demo access granted.',
    };
  },

  /**
   * Log out and clear persisted session
   */
  async signOut(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        fetch(`${getBaseUrl()}/api/auth/signout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut().catch(() => {});
      }
    } finally {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    }
  },

  /**
   * Get current cached session or user
   */
  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Update Profile (Display Name, Avatar, Password)
   */
  async updateProfile(updates: {
    displayName?: string;
    avatarUrl?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      // 1. Try Backend API
      if (token) {
        try {
          const res = await fetch(`${getBaseUrl()}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            // Update local storage
            const currentUser = await this.getCurrentUser();
            const updatedUser = {
              ...currentUser,
              user_metadata: {
                ...currentUser?.user_metadata,
                full_name: updates.displayName || currentUser?.user_metadata?.full_name,
                avatar_url: updates.avatarUrl !== undefined ? updates.avatarUrl : currentUser?.user_metadata?.avatar_url,
              },
            };
            await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
            return { success: true, message: data.message };
          }
        } catch (backendErr) {
          console.warn('Backend update failed, attempting direct Supabase fallback:', backendErr);
        }
      }

      // 2. Direct Supabase Fallback
      if (isSupabaseConfigured()) {
        const authUpdates: any = { data: {} };
        if (updates.displayName) {
          authUpdates.data.full_name = updates.displayName;
        }
        if (updates.avatarUrl !== undefined) {
          authUpdates.data.avatar_url = updates.avatarUrl;
        }
        if (updates.newPassword) {
          authUpdates.password = updates.newPassword;
        }

        const { data, error } = await supabase.auth.updateUser(authUpdates);
        if (error) {
          // If only updating avatar or name (not changing password), persist locally and succeed
          if (!updates.newPassword) {
            const currentUser = await this.getCurrentUser();
            const updatedUser = {
              ...currentUser,
              user_metadata: {
                ...currentUser?.user_metadata,
                full_name: updates.displayName || currentUser?.user_metadata?.full_name,
                avatar_url: updates.avatarUrl !== undefined ? updates.avatarUrl : currentUser?.user_metadata?.avatar_url,
              },
            };
            await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
            return { success: true, message: 'Profile updated successfully.' };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }

        return { success: true, message: 'Profile updated successfully.' };
      }

      // 3. Local Mock / Demo Update
      const currentUser = await this.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        user_metadata: {
          ...currentUser?.user_metadata,
          full_name: updates.displayName || currentUser?.user_metadata?.full_name || 'Chief Operator',
          avatar_url: updates.avatarUrl !== undefined ? updates.avatarUrl : currentUser?.user_metadata?.avatar_url,
        },
      };
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      return { success: true, message: 'Profile updated locally.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  },
};
