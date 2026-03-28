const admin = require('firebase-admin');
const firebaseAuthService = require('../services/firebaseAuthService');
const db = require('../config/firebase');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const firebaseUser = await firebaseAuthService.register(email, password, displayName);
      const idToken = firebaseUser.idToken;
      const localId = firebaseUser.localId;

      await db.collection('users').doc(localId).set({
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        coupleId: null,
        partnerId: null,
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          uid: localId,
          email: email,
          displayName: displayName || email.split('@')[0],
        },
        token: idToken,
      });
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
      res.status(400).json({ error: errorMessage });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const firebaseUser = await firebaseAuthService.login(email, password);

      const userDoc = await db.collection('users').doc(firebaseUser.localId).get();
      let userData = {
        email,
        displayName: email.split('@')[0],
      };

      if (userDoc.exists) {
        userData = userDoc.data();
      }

      res.json({
        message: 'Login successful',
        user: {
          uid: firebaseUser.localId,
          email: email,
          displayName: userData.displayName,
          coupleId: userData.coupleId,
          partnerId: userData.partnerId,
        },
        token: firebaseUser.idToken,
      });
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
      res.status(401).json({ error: errorMessage });
    }
  }

  async logout(req, res) {
    res.json({ message: 'Logout successful' });
  }

  async getCurrentUser(req, res) {
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      let partnerData = null;

      if (userData.partnerId) {
        const partnerDoc = await db.collection('users').doc(userData.partnerId).get();
        if (partnerDoc.exists) {
          partnerData = {
            uid: partnerDoc.id,
            email: partnerDoc.data().email,
            displayName: partnerDoc.data().displayName,
          };
        }
      }

      res.json({
        user: {
          uid: req.user.uid,
          email: userData.email,
          displayName: userData.displayName,
          coupleId: userData.coupleId,
          partnerId: userData.partnerId,
        },
        partner: partnerData,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
