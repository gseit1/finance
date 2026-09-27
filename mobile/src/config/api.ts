import { Platform } from 'react-native';

/**
 * PRODUCTION VERCEL BACKEND URL
 * Once you deploy your backend to Vercel, paste your live URL here:
 * e.g., 'https://your-finance-app.vercel.app'
 */
export const VERCEL_BACKEND_URL: string = 'https://finance-nine-bay.vercel.app';

/**
 * Dynamically resolves the backend server URL:
 * 1. If VERCEL_BACKEND_URL is configured, uses that for both emulator and physical APK.
 * 2. Otherwise, defaults to local dev server (10.0.2.2:3001 on Android emulator, localhost:3001 on iOS).
 */
export const getBackendBaseUrl = (): string => {
  if (VERCEL_BACKEND_URL && VERCEL_BACKEND_URL.trim().startsWith('http')) {
    return VERCEL_BACKEND_URL.trim().replace(/\/$/, '');
  }

  return Platform.select({
    android: 'http://10.0.2.2:3000',
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000',
  })!;
};
