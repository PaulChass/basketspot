import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Storage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      (localStorage as Storage).setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return (localStorage as Storage).getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      (localStorage as Storage).removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

export default Storage;