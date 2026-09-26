import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'sbs.waymarkatlas',
  appName: 'Waymark Atlas',
  webDir: 'out',
  server: {
    url: 'https://waymarkatlas.sbs/',
    cleartext: true,
  },
  android: {
    backgroundColor: '#1B3A5C',
    allowMixedContent: false,
  },
  ios: {
    backgroundColor: '#1B3A5C',
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1B3A5C',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      iosSpinnerStyle: 'small',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1B3A5C',
      overlaysWebView: false,
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
    Haptics: {
      enabled: true,
    },
    Preferences: {
      group: 'WaymarkAtlas',
    },
  },
};

export default config;
