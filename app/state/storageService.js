import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export const StorageService = {
  async getItem(key) {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Error getting item with key ${key}: ${error.message}`,
      });
      return null;
    }
  },

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Error setting item with key ${key}: ${error.message}`,
      });
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Error removing item with key ${key}: ${error.message}`,
      });
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Error Logging out: ${error.message}`,
      });
    }
  },
};
