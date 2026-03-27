import type { CapacitorConfig } from "@capacitor/cli";

const devUrl = process.env.CAPACITOR_SERVER_URL;
const prodUrl = "https://platemyday.com";

const config: CapacitorConfig = {
  appId: "com.raviautar.platemyday",
  appName: "PlateMyDay",
  webDir: "capacitor-web",
  server: devUrl
    ? {
        url: devUrl,
        cleartext: devUrl.startsWith("http://"),
      }
    : {
        url: prodUrl,
        cleartext: false,
      },
  ios: {
    scheme: "PlateMyDay",
    contentInset: "always",
    scrollEnabled: true,
    backgroundColor: "#000000",
  },
  android: {
    backgroundColor: "#000000",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#000000",
    },
  },
};

export default config;
