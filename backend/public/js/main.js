import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { collection, addDoc, where, query, onSnapshot, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

// 로그인 상태 확인
onAuthStateChanged(auth, (user) => {
	if (user) {
		document.getElementById('main-content').style.display = 'block';
		document.getElementById('logout-btn').style.display = 'inline-block';
		document.getElementById('nav-auth').style.display = 'none';

		loadItems(user.uid); // 로그인한 유저의 아이템 목록 불러오기
	} else {
		// 비로그인 시 로그인/회원가입 링크 보이기
		document.getElementById('main-content').style.display = 'none';
		document.getElementById('logout-btn').style.display = 'none';
		document.getElementById('nav-auth').style.display = 'block';
	}
});

// 로그아웃 처리
document.getElementById('logout-btn').addEventListener('click', async () => {
	await signOut(auth);
	alert('로그아웃 되었습니다.');
	window.location.href = 'login.html';
});

// 아이템 추가
document.addEventListener('DOMContentLoaded', () => {
	const addItemBtn = document.getElementById('add-item-btn');
	if (addItemBtn) {
		addItemBtn.addEventListener('click', async () => {
			const itemName = document.getElementById('item-name').value;
			const itemDescription = document.getElementById('item-description').value;
			const user = auth.currentUser;

			if (!itemName || !itemDescription) {
				alert('아이템 이름, 설명을 입력하세요!');
				return;
			}
			if (itemName.length < 3 || itemDescription.length < 10) {
				alert('아이템 이름은 3자 이상, 설명은 10자 이상이어야 합니다.');
				return;
			}

			if (user) {
				await addDoc(collection(db, 'items'), {
					userId: user.uid,
					name: itemName,
					description: itemDescription,
					timestamp: new Date(),
				});

				document.getElementById('item-name').value = '';
				document.getElementById('item-description').value = '';
			}
		});
	}
});

// 아이템 불러오기
function loadItems(userId) {
	const itemList = document.getElementById('item-list');
	itemList.innerHTML = '';

	const q = query(collection(db, 'items'), where('userId', '==', userId), orderBy('timestamp', 'desc'));

	onSnapshot(q, (snapshot) => {
		itemList.innerHTML = '';
		snapshot.forEach((doc) => {
			const item = doc.data();
			const li = document.createElement('li');
			li.textContent = `${item.name} - ${item.description}`;
			itemList.appendChild(li);
		});
	});
}
