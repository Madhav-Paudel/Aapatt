import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@aapatt_user';
const TOKEN_KEY = '@aapatt_token';

export class AuthService {
  static async setUser(userData) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  static async getUser() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async getCurrentUser() {
    return await this.getUser();
  }

  static async setToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  static async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static async logout() {
    try {
      await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  static async isAuthenticated() {
    const user = await this.getUser();
    const token = await this.getToken();
    return !!(user && token);
  }
}