const axios = require('axios');

const FIREBASE_API_KEY = 'AIzaSyBokK1uxWbre54SIAvcDbpUsBXrfDc2p-4';

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      { idToken }
    );

    const users = response.data.users;
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const user = users[0];
    req.user = {
      uid: user.localId,
      email: user.email,
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

module.exports = verifyToken;
