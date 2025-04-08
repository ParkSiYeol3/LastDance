// item-detail.js
import { db, auth } from './firebase-config.js';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const itemDetailEl = document.getElementById('item-detail');
const requestBtn = document.getElementById('rental-request-btn');

const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');

let currentUser = null;
let currentItem = null;

onAuthStateChanged(auth, async (user) => {
	currentUser = user;
	await loadItemDetail();
});

async function loadItemDetail() {
	if (!itemId) {
		itemDetailEl.innerHTML = '<p>아이템 ID가 없습니다.</p>';
		return;
	}

	try {
		const docRef = doc(db, 'items', itemId);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			itemDetailEl.innerHTML = '<p>아이템을 찾을 수 없습니다.</p>';
			return;
		}

		const item = docSnap.data();
		currentItem = item;

		itemDetailEl.innerHTML = `
      <div class="item-card">
        <h2>${item.name}</h2>
        <p><strong>설명:</strong> ${item.description}</p>
        ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}" />` : ''}
      </div>
    `;

		if (!currentUser) return;

		if (currentUser.uid === item.userId) {
			itemDetailEl.insertAdjacentHTML('beforeend', '<p style="margin-top: 1rem; color: gray;">본인 상품</p>');
			return;
		}

		watchRentalStatus();
	} catch (error) {
		console.error('아이템 로딩 오류:', error);
		itemDetailEl.innerHTML = '<p>아이템 정보를 불러오는 데 실패했습니다.</p>';
	}
}

function watchRentalStatus() {
	const q = query(collection(db, 'rentals'), where('itemId', '==', itemId), where('requesterId', '==', currentUser.uid));

	onSnapshot(q, (snapshot) => {
		requestBtn.style.display = 'none';

		if (!snapshot.empty) {
			const rental = snapshot.docs[0].data();
			const status = rental.status;

			let message = '';
			if (status === 'pending') {
				message = '요청을 대기 중입니다.';
			} else if (status === 'accepted') {
				message = '요청이 수락되었습니다!';
			} else if (status === 'rejected') {
				message = '요청이 거절되었습니다.';
			}

			const existing = document.querySelector('.rental-status');
			if (!existing) {
				itemDetailEl.insertAdjacentHTML('beforeend', `<p class="rental-status" style="margin-top:1rem; color:gray;">${message}</p>`);
			} else {
				existing.textContent = message;
			}
		} else {
			requestBtn.style.display = 'inline-block';
			requestBtn.addEventListener('click', handleRentalRequest);
		}
	});
}

async function handleRentalRequest() {
	if (!currentUser || !currentItem) return;

	try {
		await addDoc(collection(db, 'rentals'), {
			itemId,
			requesterId: currentUser.uid,
			ownerId: currentItem.userId,
			status: 'pending',
			timestamp: serverTimestamp(),
		});
		alert('대여 요청이 완료되었습니다.');
	} catch (error) {
		console.error('대여 요청 실패:', error);
		alert('대여 요청 중 오류가 발생했습니다.');
	}
}
