import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_NAME = "profile.name";
const KEY_AVATAR = "profile.avatarUri";

// --- Nombre ---
export async function getProfileName(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY_NAME)) ?? "";
  } catch {
    return "";
  }
}

export async function setProfileName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_NAME, name);
  } catch {}
}

// --- Avatar (uri o preset:xxx) ---
export async function getProfileAvatarUri(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY_AVATAR)) ?? "";
  } catch {
    return "";
  }
}

export async function setProfileAvatarUri(uri: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_AVATAR, uri);
  } catch {}
}

export async function clearProfileAvatarUri(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_AVATAR);
  } catch {}
}
