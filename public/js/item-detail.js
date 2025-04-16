// item-detail.js
import { db, auth } from './firebase-config.js';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, onSnapshot, deleteDoc, updateDoc, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
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
	loadComments();
	loadRentalHistory();
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

		const isOwner = currentUser && currentUser.uid === item.userId;

		itemDetailEl.innerHTML = `
      <div class="item-card">
        <h2>${item.name}</h2>
        <p><strong>설명:</strong> ${item.description}</p>
        ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}" />` : ''}
        ${
			isOwner
				? `
          <div class="action-buttons">
            <button id="edit-btn">수정</button>
            <button id="delete-btn" class="danger">삭제</button>
          </div>
        `
				: ''
		}
      </div>
      <div id="comment-section"><h3>💬 댓글</h3><div id="comments"></div></div>
      <div id="rental-history-section"><h3>📜 대여 기록</h3><div id="rental-log"></div></div>
    `;

		if (isOwner) {
			document.getElementById('edit-btn').addEventListener('click', () => showEditForm(item, itemId));
			document.getElementById('delete-btn').addEventListener('click', async () => {
				const confirmDelete = confirm('정말로 이 상품을 삭제하시겠습니까?');
				if (confirmDelete) {
					await deleteDoc(doc(db, 'items', itemId));
					alert('상품이 삭제되었습니다.');
					window.location.href = 'mypage.html';
				}
			});
			return; // 소유자일 경우 대여 요청 로직 실행하지 않도록 함
		}

		if (!currentUser) return;
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
			const rental = snapshot.docs[0];
			const data = rental.data();
			const status = data.status;

			let message = '';
			if (status === 'pending') message = '요청을 대기 중입니다.';
			if (status === 'accepted') message = '요청이 수락되었습니다!';
			if (status === 'rejected') message = '요청이 거절되었습니다.';
			if (status === 'confirmed') message = '대여가 확정되었습니다.';

			const existing = document.querySelector('.rental-status');
			if (!existing) {
				itemDetailEl.insertAdjacentHTML('beforeend', `<p class="rental-status" style="margin-top:1rem; color:gray;">${message}</p>`);
			} else {
				existing.textContent = message;
			}

			// 소유자만 대여 확정 가능
			if (data.status === 'accepted' && currentUser.uid === data.ownerId) {
				const confirmBtn = document.createElement('button');
				confirmBtn.textContent = '대여 확정';
				confirmBtn.addEventListener('click', async () => {
					await updateDoc(doc(db, 'rentals', rental.id), { status: 'confirmed' });
					alert('대여를 확정했습니다.');
				});
				itemDetailEl.appendChild(confirmBtn);
			}
		} else {
			requestBtn.style.display = 'inline-block';
			requestBtn.addEventListener('click', handleRentalRequest);
		}
	});
}

async function handleRentalRequest() {
	if (!currentUser || !currentItem) return;

	if (currentUser.uid === currentItem.userId) {
		alert('본인의 상품에는 대여 요청을 할 수 없습니다.');
		return;
	}

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

function showEditForm(item, id) {
	itemDetailEl.innerHTML = `
    <h2>상품 수정</h2>
    <form id="edit-form">
      <input type="text" id="edit-name" value="${item.name}" placeholder="상품명" required /><br>
      <textarea id="edit-description" placeholder="설명" required>${item.description}</textarea><br>
      <input type="url" id="edit-image" value="${item.imageURL || ''}" placeholder="이미지 주소(URL)" /><br>
      <button type="submit">저장</button>
      <button type="button" id="cancel-edit">취소</button>
    </form>
  `;

	document.getElementById('cancel-edit').addEventListener('click', () => loadItemDetail());

	document.getElementById('edit-form').addEventListener('submit', async (e) => {
		e.preventDefault();
		const newName = document.getElementById('edit-name').value.trim();
		const newDesc = document.getElementById('edit-description').value.trim();
		const newImg = document.getElementById('edit-image').value.trim();

		if (!newName || !newDesc) {
			alert('모든 항목을 입력해주세요.');
			return;
		}

		await updateDoc(doc(db, 'items', id), {
			name: newName,
			description: newDesc,
			imageURL: newImg || null,
		});

		alert('수정이 완료되었습니다.');
		await loadItemDetail();
	});
}

// 💬 댓글 기능
async function loadComments() {
	const commentsEl = document.getElementById('comments');
	const q = query(collection(db, 'comments'), where('itemId', '==', itemId), orderBy('timestamp', 'asc'));

	onSnapshot(q, async (snapshot) => {
		commentsEl.innerHTML = '';
		for (const docSnap of snapshot.docs) {
			const data = docSnap.data();
			const userDoc = await getDoc(doc(db, 'users', data.userId));
			const userName = userDoc.exists() ? userDoc.data().name : '익명';

			const p = document.createElement('p');
			const date = data.timestamp?.toDate();
			const timeString = date ? date.toLocaleString('ko-KR') : '';
			p.textContent = `${userName} (${timeString}) : ${data.text}`;
			commentsEl.appendChild(p);
		}
	});

	if (currentUser) {
		const form = document.createElement('form');
		form.innerHTML = `
      <input type="text" id="comment-input" placeholder="댓글을 입력하세요" required />
      <button type="submit">작성</button>
    `;
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const text = document.getElementById('comment-input').value;
			if (!text) return;
			await addDoc(collection(db, 'comments'), {
				itemId,
				userId: currentUser.uid,
				text,
				timestamp: serverTimestamp(),
			});
			form.reset();
		});
		commentsEl.parentNode.appendChild(form);
	}
}

// 📜 대여 상태 로그 출력
async function loadRentalHistory() {
	const logContainer = document.getElementById('rental-log');
	const q = query(collection(db, 'rentals'), where('itemId', '==', itemId), orderBy('timestamp', 'desc'));

	onSnapshot(q, async (snapshot) => {
		logContainer.innerHTML = '';
		for (const snap of snapshot.docs) {
			const log = snap.data();
			const userDoc = await getDoc(doc(db, 'users', log.requesterId));
			const name = userDoc.exists() ? userDoc.data().name : '사용자';

			const p = document.createElement('p');
			p.textContent = `${name} - 상태: ${log.status}`;
			logContainer.appendChild(p);
		}
	});
}
