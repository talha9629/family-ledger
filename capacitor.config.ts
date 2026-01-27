import type { CapacitorConfig } from '@capacitor/cli';

// Determine if we're in development mode
// Note: In Capacitor, NODE_ENV isn't always reliable during native builds
// For production builds, these values will be false (secure defaults)
const isDevelopment = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'app.lovable.ff9da2d8757247a185779ed1d783657b',
  appName: 'Family Finance',
  webDir: 'dist',
  server: {
    // Only use dev server URL in development; production uses bundled assets
    ...(isDevelopment && {
      url: 'https://ff9da2d8-7572-47a1-8577-9ed1d783657b.lovableproject.com?forceHideBadge=true',
    }),
    // Disable cleartext (HTTP) traffic in production to enforce HTTPS
    cleartext: isDevelopment
  },
  android: {
    // Disable mixed content in production to prevent downgrade attacks
    allowMixedContent: isDevelopment,
    // Disable input capture unless specifically needed
    captureInput: false,
    // CRITICAL: Disable WebView debugging in production to prevent data exposure
    webContentsDebuggingEnabled: isDevelopment
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2a9d8f',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP'
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#2a9d8f'
    }
  }
};

export default config;