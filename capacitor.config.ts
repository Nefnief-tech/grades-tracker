import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nief.tech',
  appName: 'grade-tracker-app',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
