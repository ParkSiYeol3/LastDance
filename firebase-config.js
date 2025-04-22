// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCiZ5Vnv9mlyOaMHc2ZPQVVJq62sEzObo0",
    authDomain: "test-546f4.firebaseapp.com",
    projectId: "test-546f4",
    storageBucket: "test-546f4.firebasestorage.app",
    messagingSenderId: "374914365966",
    appId: "1:374914365966:web:b3858dd1f47741d6419a5f",
    measurementId: "G-0N7F81P98B"
  };
  
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
