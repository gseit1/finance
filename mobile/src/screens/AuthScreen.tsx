import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/authService';

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup';
  onAuthenticated: () => void;
  onBackToWelcome: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signin',
  onAuthenticated,
  onBackToWelcome,
}) => {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and master key.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'signin') {
        const result = await authService.signIn(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
          setLoading(false);
          return;
        }
        setSuccessMessage('Access granted. Unlocking ledger...');
      } else {
        const result = await authService.signUp(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Registration failed.');
          setLoading(false);
          return;
        }
        setSuccessMessage(result.message || 'Vault initialized. Unlocking ledger...');
      }

      // Smooth transition to main app flow
      setTimeout(() => {
        setLoading(false);
        onAuthenticated();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.contentContainer,
            {
              paddingTop: Math.max(insets.top + 8, 48),
              paddingBottom: Math.max(insets.bottom + 12, 28),
            },
          ]}
        >
          {/* Top Bar: Clean isolated back button, perfectly padded below notch/camera */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={onBackToWelcome}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Upper / Middle Form Block */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBlock}
          >
            {/* Brand Logo Showcase */}
            <View style={styles.brandLogoRow}>
              <View style={styles.brandLogoFrame}>
                <Image
                  source={require('../assets/finance-logo.png')}
                  style={styles.brandLogoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Flow Control: Segmented hairline pill switch */}
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                style={[styles.segment, mode === 'signin' && styles.activeSegment]}
                onPress={() => {
                  setMode('signin');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'signin' ? styles.activeSegmentText : styles.inactiveSegmentText,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segment, mode === 'signup' && styles.activeSegment]}
                onPress={() => {
                  setMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'signup' ? styles.activeSegmentText : styles.inactiveSegmentText,
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dynamic Header */}
            <View style={styles.headerBlock}>
              <Text style={styles.headerTitle}>
                {mode === 'signin' ? 'Enter your vault.' : 'Initialize ledger.'}
              </Text>
              <Text style={styles.headerSubtitle}>
                Authenticate using your registered email and secure master key.
              </Text>
            </View>

            {/* Field 1: Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>LEDGER IDENTITY (EMAIL)</Text>
              <TextInput
                style={styles.input}
                placeholder="operator@financial-kernel.com"
                placeholderTextColor="#52525B"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            {/* Field 2: Master Key / Password */}
            <View style={styles.fieldContainer}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>MASTER KEY (PASSWORD)</Text>
                {mode === 'signin' && (
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.forgotText}>Forgot key?</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.passwordInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="••••••••••••"
                  placeholderTextColor="#52525B"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.revealText}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error / Success Feedback */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            {successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}
          </ScrollView>

          {/* Bottom Pinned Block: Thumb-Reachable Primary CTA */}
          <View style={styles.bottomPinnedBlock}>
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={handleAuth}
              activeOpacity={0.88}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#08080A" />
              ) : (
                <Text style={styles.unlockButtonText}>
                  {mode === 'signin' ? 'UNLOCK LEDGER' : 'INITIALIZE VAULT'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08080A',
  },
  keyboardAvoid: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topBar: {
    height: 44,
    justifyContent: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#FAFAFA',
    fontWeight: '700',
    marginTop: -2,
  },
  scrollBlock: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  brandLogoRow: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 6,
  },
  brandLogoFrame: {
    width: 82,
    height: 82,
    borderRadius: 22,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  brandLogoImage: {
    width: 76,
    height: 76,
    borderRadius: 18,
  },
  segmentedContainer: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  activeSegment: {
    backgroundColor: '#27272A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  activeSegmentText: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  inactiveSegmentText: {
    color: '#71717A',
    fontWeight: '500',
  },
  headerBlock: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FAFAFA',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#71717A',
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  biometricButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: '#141416',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  biometricGlyph: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintArcOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FAFAFA',
  },
  fingerprintArcInner: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  biometricText: {
    color: '#FAFAFA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dividerText: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#52525B',
    fontWeight: '700',
  },
  fieldContainer: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginBottom: 10,
    justifyContent: 'center',
  },
  fieldLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.2,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 3,
  },
  input: {
    fontSize: 14,
    color: '#FAFAFA',
    padding: 0,
    fontWeight: '500',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  forgotText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#71717A',
    fontWeight: '600',
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revealText: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
    color: '#A1A1AA',
    fontWeight: '700',
    paddingLeft: 10,
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#F43F5E',
    marginTop: 4,
    marginBottom: 8,
  },
  successText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#10B981',
    marginTop: 4,
    marginBottom: 8,
  },
  bottomPinnedBlock: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  unlockButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  unlockButtonText: {
    color: '#08080A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
