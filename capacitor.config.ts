import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ff9da2d8757247a185779ed1d783657b',
  appName: 'Family Finance',
  webDir: 'dist',
  server: {
    url: 'https://ff9da2d8-7572-47a1-8577-9ed1d783657b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
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