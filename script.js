import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, setDoc, doc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

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

// 회원가입 기능
document.getElementById('signup-btn').addEventListener('click', function () {
	const name = document.getElementById('signup-name').value;
	const email = document.getElementById('signup-email').value;
	const password = document.getElementById('signup-password').value;
	const zipcode = document.getElementById('signup-zipcode').value;
	const address = document.getElementById('signup-address').value;

	auth.createUserWithEmailAndPassword(email, password)
		.then((userCredential) => {
			const user = userCredential.user;
			return db.collection('users').doc(user.uid).set({
				name: name,
				email: email,
				zipcode: zipcode,
				address: address,
			});
		})
		.then(() => {
			alert('회원가입 완료! 로그인 해주세요.');
		})
		.catch((error) => alert(error.message));
});

// 로그인 기능
document.getElementById('login-btn').addEventListener('click', function () {
	const email = document.getElementById('login-email').value;
	const password = document.getElementById('login-password').value;

	auth.signInWithEmailAndPassword(email, password)
		.then((userCredential) => {
			document.getElementById('auth').style.display = 'none';
			document.getElementById('main').style.display = 'block';
			loadItems();
		})
		.catch((error) => alert(error.message));
});

// 로그아웃 기능
document.getElementById('logout-btn').addEventListener('click', function () {
	auth.signOut().then(() => {
		document.getElementById('auth').style.display = 'block';
		document.getElementById('main').style.display = 'none';
	});
});

// 아이템 등록
document.getElementById('add-item-btn').addEventListener('click', function () {
	const itemName = document.getElementById('item-name').value;
	const itemDescription = document.getElementById('item-description').value;
	const user = auth.currentUser;

	if (user) {
		db.collection('items')
			.add({
				userId: user.uid,
				name: itemName,
				description: itemDescription,
				timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			})
			.then(() => {
				alert('아이템 추가 완료!');
				document.getElementById('item-name').value = '';
				document.getElementById('item-description').value = '';
				loadItems();
			});
	}
});

// 아이템 목록 불러오기
function loadItems() {
	const user = auth.currentUser;
	if (user) {
		db.collection('items')
			.where('userId', '==', user.uid)
			.orderBy('timestamp', 'desc')
			.onSnapshot((snapshot) => {
				const itemList = document.getElementById('item-list');
				itemList.innerHTML = '';
				snapshot.forEach((doc) => {
					const item = doc.data();
					const li = document.createElement('li');
					li.textContent = `${item.name} - ${item.description}`;
					itemList.appendChild(li);
				});
			});
	}
}
