// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase config from Firebase console
const firebaseConfig = {
	apiKey: 'AIzaSyDO4Ob4MXJn2dNw87zlfygBKUf87hzo_9U',
	authDomain: 'last-dance-96dd5.firebaseapp.com',
	projectId: 'last-dance-96dd5',
	storageBucket: 'last-dance-96dd5.firebasestorage.app',
	messagingSenderId: '1072490774071',
	appId: '1:1072490774071:web:e64ce7372c721d636489b2',
	measurementId: 'G-3BSQKRSBMN',
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
