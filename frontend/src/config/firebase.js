import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBokK1uxWbre54SIAvcDbpUsBXrfDc2p-4",
  authDomain: "couple-diary-lq.firebaseapp.com",
  projectId: "couple-diary-lq",
  storageBucket: "couple-diary-lq.firebasestorage.app",
  messagingSenderId: "976311261744",
  appId: "1:976311261744:web:f7e4df08a968ac637debf5",
  measurementId: "G-586PZ3T5WT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
