// chat.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const chatBox = document.getElementById('chat-box');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

let currentUser = null;

// 로그인 상태 확인
onAuthStateChanged(auth, (user) => {
	if (!user) {
		alert('로그인이 필요합니다.');
		window.location.href = 'login.html';
	} else {
		currentUser = user;
		listenForMessages();
	}
});

// 메시지 보내기
sendBtn.addEventListener('click', async () => {
	const message = input.value.trim();
	if (!message) return;

	await addDoc(collection(db, 'chat'), {
		uid: currentUser.uid,
		text: message,
		timestamp: serverTimestamp(),
	});

	input.value = '';
});

// 실시간 메시지 수신
function listenForMessages() {
	const q = query(collection(db, 'chat'), orderBy('timestamp'));
	onSnapshot(q, (snapshot) => {
		chatBox.innerHTML = '';
		snapshot.forEach((doc) => {
			const data = doc.data();
			const msg = document.createElement('div');
			msg.textContent = `${data.text}`;
			chatBox.appendChild(msg);
		});
		chatBox.scrollTop = chatBox.scrollHeight;
	});
}
