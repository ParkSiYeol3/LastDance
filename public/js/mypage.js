// mypage.js - 내가 등록한 상품 + 받은 대여 요청 불러오기
import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const myItemsContainer = document.getElementById('my-items');

onAuthStateChanged(auth, async (user) => {
	if (!user) {
		alert('로그인 후 이용해 주세요.');
		window.location.href = 'login.html';
		return;
	}

	await loadMyItems(user.uid);
	await loadRentalRequests(user.uid);
});

async function loadMyItems(userId) {
	const q = query(collection(db, 'items'), where('userId', '==', userId), orderBy('timestamp', 'desc'));
	const snapshot = await getDocs(q);
	myItemsContainer.innerHTML = '';

	snapshot.forEach((docSnap) => {
		const item = docSnap.data();
		const div = document.createElement('div');
		div.className = 'my-item-card';

		div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}" />` : ''}
    `;

		myItemsContainer.appendChild(div);
	});
}

async function loadRentalRequests(userId) {
	const q = query(collection(db, 'rentals'), where('ownerId', '==', userId), orderBy('timestamp', 'desc'));
	const snapshot = await getDocs(q);

	if (snapshot.empty) return;

	const requestsTitle = document.createElement('h2');
	requestsTitle.textContent = '받은 대여 요청';
	myItemsContainer.insertAdjacentElement('afterend', requestsTitle);

	const requestList = document.createElement('div');
	requestList.className = 'item-list';
	myItemsContainer.parentNode.insertBefore(requestList, requestsTitle.nextSibling);

	for (const docSnap of snapshot.docs) {
		const request = docSnap.data();
		const itemSnap = await getDoc(doc(db, 'items', request.itemId));
		const item = itemSnap.exists() ? itemSnap.data() : { name: '알 수 없음', description: '' };

		const card = document.createElement('div');
		card.className = 'item-card';
		card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>요청자 ID:</strong> ${request.requesterId}</p>
      <p><strong>상태:</strong> ${request.status}</p>
    `;

		if (request.status === 'pending') {
			const acceptBtn = document.createElement('button');
			acceptBtn.textContent = '수락';
			acceptBtn.addEventListener('click', () => updateRequestStatus(docSnap.id, 'accepted'));

			const rejectBtn = document.createElement('button');
			rejectBtn.textContent = '거절';
			rejectBtn.addEventListener('click', () => updateRequestStatus(docSnap.id, 'rejected'));

			card.appendChild(acceptBtn);
			card.appendChild(rejectBtn);
		}

		requestList.appendChild(card);
	}
}

async function updateRequestStatus(rentalId, newStatus) {
	try {
		const rentalRef = doc(db, 'rentals', rentalId);
		await updateDoc(rentalRef, { status: newStatus });
		alert(`요청이 '${newStatus}' 상태로 변경되었습니다.`);
		location.reload();
	} catch (error) {
		console.error('상태 변경 오류:', error);
		alert('요청 상태를 변경하는 데 실패했습니다.');
	}
}
