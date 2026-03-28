const axios = require('axios');

const FIREBASE_API_KEY = 'AIzaSyBokK1uxWbre54SIAvcDbpUsBXrfDc2p-4';
const FIREBASE_PROJECT_ID = 'couple-diary-lq';

class FirebaseAuthService {
  async register(email, password, displayName) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;

    const response = await axios.post(url, {
      email,
      password,
      displayName: displayName || email.split('@')[0],
      returnSecureToken: true
    });

    return response.data;
  }

  async login(email, password) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true
    });

    return response.data;
  }

  async getUserInfo(idToken) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;

    const response = await axios.post(url, {
      idToken
    });

    return response.data;
  }
}

module.exports = new FirebaseAuthService();
