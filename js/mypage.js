// mypage.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const container = document.getElementById('my-items');

onAuthStateChanged(auth, async (user) => {
	if (!user) {
		alert('로그인이 필요합니다.');
		window.location.href = 'login.html';
		return;
	}

	const q = query(collection(db, 'items'), where('userId', '==', user.uid));
	const snapshot = await getDocs(q);

	if (snapshot.empty) {
		container.textContent = '등록한 상품이 없습니다.';
		return;
	}

	snapshot.forEach((doc) => {
		const item = doc.data();
		const div = document.createElement('div');
		div.className = 'item-card';
		div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}" />` : ''}
    `;
		container.appendChild(div);
	});
});
