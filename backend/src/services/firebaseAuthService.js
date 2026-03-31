const axios = require('axios');

const FIREBASE_API_KEY = 'AIzaSyBokK1uxWbre54SIAvcDbpUsBXrfDc2p-4';
const FIREBASE_PROJECT_ID = 'couple-diary-lq';

const axiosInstance = axios.create({
  timeout: 30000,
  proxy: false
});

class FirebaseAuthService {
  async register(email, password, displayName) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;

    try {
      const response = await axiosInstance.post(url, {
        email,
        password,
        displayName: displayName || email.split('@')[0],
        returnSecureToken: true
      });
      return response.data;
    } catch (error) {
      console.error('Firebase Auth API Error:', error.message);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async login(email, password) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    try {
      const response = await axiosInstance.post(url, {
        email,
        password,
        returnSecureToken: true
      });
      return response.data;
    } catch (error) {
      console.error('Firebase Auth API Error:', error.message);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async getUserInfo(idToken) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;

    try {
      const response = await axiosInstance.post(url, {
        idToken
      });
      return response.data;
    } catch (error) {
      console.error('Firebase Auth API Error:', error.message);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
}

module.exports = new FirebaseAuthService();