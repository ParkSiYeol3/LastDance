// settings.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut, deleteUser, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const logoutBtn = document.getElementById('logout-btn');
const deleteBtn = document.getElementById('delete-account-btn');
const changePwBtn = document.getElementById('change-password-btn');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
	if (!user) {
		alert('로그인이 필요합니다.');
		window.location.href = 'login.html';
	} else {
		currentUser = user;
	}
});

logoutBtn.addEventListener('click', async () => {
	await signOut(auth);
	alert('로그아웃 되었습니다.');
	window.location.href = 'index.html';
});

deleteBtn.addEventListener('click', async () => {
	if (confirm('정말 계정을 삭제하시겠습니까?')) {
		try {
			await deleteUser(currentUser);
			alert('계정이 삭제되었습니다.');
			window.location.href = 'index.html';
		} catch (err) {
			alert('재로그인 후 다시 시도해주세요.');
		}
	}
});

changePwBtn.addEventListener('click', async () => {
	if (!currentUser?.email) return;
	try {
		await sendPasswordResetEmail(auth, currentUser.email);
		alert('비밀번호 재설정 이메일이 전송되었습니다.');
	} catch (err) {
		alert('이메일 전송 실패: ' + err.message);
	}
});
