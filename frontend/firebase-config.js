// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // ✅ 추가
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDO4Ob4MXJn2dNw87zlfygBKUf87hzo_9U",
  authDomain: "last-dance-96dd5.firebaseapp.com",
  databaseURL: "https://last-dance-96dd5-default-rtdb.firebaseio.com",
  projectId: "last-dance-96dd5",
  storageBucket: "last-dance-96dd5.firebasestorage.app",
  messagingSenderId: "1072490774071",
  appId: "1:1072490774071:web:e64ce7372c721d636489b2",
  measurementId: "G-3BSQKRSBMN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);   // ✅ 이 줄 추가
export const db = getFirestore(app);

export const API_URL = "http://192.168.0.6:3000"; // API_URL을 PC IP로 변경
