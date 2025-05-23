// firebase-config.js
import { initializeApp, getApps, getApp } from 'firebase/app'; // ✅ getApps, getApp 추가
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey: 'AIzaSyDO4Ob4MXJn2dNw87zlfygBKUf87hzo_9U',
	authDomain: 'last-dance-96dd5.firebaseapp.com',
	databaseURL: 'https://last-dance-96dd5-default-rtdb.firebaseio.com',
	projectId: 'last-dance-96dd5',
	storageBucket: 'last-dance-96dd5.appspot.com',
	messagingSenderId: '1072490774071',
	appId: '1:1072490774071:web:e64ce7372c721d636489b2',
	measurementId: 'G-3BSQKRSBMN',
};

// ✅ 이미 앱이 있으면 getApp(), 없으면 initializeApp()
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

<<<<<<< HEAD
export const API_URL = 'http://192.168.0.6:3000';
=======
export const API_URL = 'http:///10.20.76.18:3000';
>>>>>>> 94f7e470e02794912e941516186b0923bf43c2ce
// API_URL을 PC IP로 변경
