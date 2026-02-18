// src/shared/utils/openStoreReview.ts
import { Platform, Linking, Alert } from "react-native";
import * as Application from "expo-application";
import Constants from "expo-constants";

// ✅ Estos 2 los sacamos de app.json (extra + android.package)
const getIosAppStoreId = (): string | null => {
  const extra = Constants.expoConfig?.extra as any;
  const id = extra?.iosAppStoreId;
  return typeof id === "string" && id.trim() ? id.trim() : null;
};

const getAndroidPackage = (): string | null => {
  // expoConfig.android.package (SDK 54)
  const pkg = (Constants.expoConfig as any)?.android?.package;
  if (typeof pkg === "string" && pkg.trim()) return pkg.trim();

  // fallback (en builds suele estar bien)
  const detected = Application.applicationId;
  if (typeof detected === "string" && detected.trim()) return detected.trim();

  return null;
};

const isExpoGo = () => {
  // En Expo Go esto suele ser "expo" / "expo-go"
  const owner = (Constants.expoConfig as any)?.owner;
  const appId = Application.applicationId ?? "";
  return appId.includes("host.exp.exponent") || owner === "expo";
};

export async function openStoreReview(): Promise<void> {
  try {
    if (Platform.OS === "android") {
      const pkg = getAndroidPackage();
      if (!pkg) {
        Alert.alert("Error", "No se pudo determinar el package de Android.");
        return;
      }

      // ✅ En Expo Go: ir directo a web (market:// suele fallar o no apuntar bien)
      if (isExpoGo()) {
        await Linking.openURL(`https://play.google.com/store/apps/details?id=${pkg}`);
        return;
      }

      // ✅ En build real: intenta Play Store app, si falla web
      try {
        await Linking.openURL(`market://details?id=${pkg}`);
      } catch {
        await Linking.openURL(`https://play.google.com/store/apps/details?id=${pkg}`);
      }
      return;
    }

    if (Platform.OS === "ios") {
      const appStoreId = getIosAppStoreId();
      if (!appStoreId) {
        Alert.alert("Pronto", "La app aún no está disponible para reseñas en App Store.");
        return;
      }

      // ✅ Mejor ruta en iOS para escribir reseña
      const itmsUrl = `itms-apps://itunes.apple.com/app/id${appStoreId}?action=write-review`;
      const webUrl = `https://apps.apple.com/app/id${appStoreId}?action=write-review`;

      // En Expo Go / simulador puede fallar itms-apps; caemos a web
      try {
        await Linking.openURL(itmsUrl);
      } catch {
        await Linking.openURL(webUrl);
      }
      return;
    }
  } catch {
    Alert.alert("Error", "No se pudo abrir la tienda.");
  }
}