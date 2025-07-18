import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "rideapp",
  slug: "rideapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/images/icon.png",
  scheme: "myapp",
  newArchEnabled: true,
  userInterfaceStyle: "automatic",
  splash: {
    image: "./src/assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: "com.ritik.rideapp",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_MAP_API_KEY,
    },
  },
  android: {
    ...config.android,
    package: "com.chuks.rideapp",
    adaptiveIcon: {
      foregroundImage: "./src/assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_MAP_API_KEY,
      },
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./src/assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    "expo-font",
  ],
  experiments: {
    typedRoutes: true,
  },
});
