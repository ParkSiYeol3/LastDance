// Firebase SDK 가져오기 (HTML에서 스크립트로 추가해야 함)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

// Firebase 설정
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
const db = getFirestore(app);

// auth와 db를 export해서 다른 JS 파일에서 사용 가능하게 함
export { auth, db };
