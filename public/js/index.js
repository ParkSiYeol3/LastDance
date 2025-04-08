// index.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { collection, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { loadHeader } from './header-loader.js';

document.addEventListener('DOMContentLoaded', async () => {
	await loadHeader(); // 헤더 먼저 불러오기

	const itemList = document.getElementById('item-list');
	const addProductBtn = document.querySelector('.add-item-btn');
	const logoutBtn = document.getElementById('logout-btn');
	const loginLink = document.getElementById('login-link');

	let currentUser = null;

	// 로그인 상태 확인
	onAuthStateChanged(auth, (user) => {
		currentUser = user;

		if (user) {
			if (logoutBtn) logoutBtn.style.display = 'inline-block';
			if (loginLink) loginLink.style.display = 'none';
		} else {
			if (logoutBtn) logoutBtn.style.display = 'none';
			if (loginLink) loginLink.style.display = 'inline-block';
		}

		fetchItems(); // 로그인 여부 관계없이 아이템은 보여줌
	});

	// 상품 등록 버튼 클릭 시 로그인 여부 확인
	if (addProductBtn) {
		addProductBtn.addEventListener('click', () => {
			if (!currentUser) {
				alert('상품 등록은 로그인 후 이용 가능합니다.');
				window.location.href = 'login.html';
			} else {
				window.location.href = 'add-item.html';
			}
		});
	}

	// Firestore에서 아이템 불러오기
	async function fetchItems() {
		itemList.innerHTML = '';
		const q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));
		const snapshot = await getDocs(q);

		snapshot.forEach((doc) => {
			const item = doc.data();

			const div = document.createElement('div');
			div.className = 'item-card';
			div.style.cursor = 'pointer';
			div.addEventListener('click', () => {
				window.location.href = `item-detail.html?id=${doc.id}`;
			});

			div.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}" />` : ''}
      `;

			itemList.appendChild(div);
		});
	}
});
