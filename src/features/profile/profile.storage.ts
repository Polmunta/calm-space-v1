import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_NAME = "profile.name";

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
