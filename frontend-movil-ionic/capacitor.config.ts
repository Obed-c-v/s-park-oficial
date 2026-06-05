import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'parkinsong',
  webDir: 'www',
  // 📡 RED LOCAL: Activa Live Reload desde el celular via Wi-Fi
  // El celular cargará la app desde la PC en vez de archivos locales
  server: {
    // url: 'http://192.168.50.109:8100',
    cleartext: true  // Permite HTTP (sin HTTPS) en Android
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true
      }
    }
  }
};

export default config;
