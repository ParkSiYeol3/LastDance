// settings.js - 설정 페이지 스크립트 (알림 확장 포함, setDoc으로 수정)
import { auth, db } from './firebase-config.js';
import { updateProfile, signOut, onAuthStateChanged, deleteUser, updatePassword } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
	if (!user) {
		alert('로그인이 필요합니다.');
		window.location.href = 'login.html';
		return;
	}
	currentUser = user;
	await loadUserProfile(user);
});

async function loadUserProfile(user) {
	const userDoc = await getDoc(doc(db, 'users', user.uid));
	if (!userDoc.exists()) return;
	const userData = userDoc.data();

	document.getElementById('user-name').textContent = userData.name || '';
	document.getElementById('user-email').textContent = user.email || '';
	document.getElementById('user-address').textContent = userData.address || '';

	// 알림 설정 체크 상태 불러오기
	document.getElementById('notif-rental').checked = userData.notifRental || false;
	document.getElementById('notif-email').checked = userData.notifEmail || false;
	document.getElementById('notif-push').checked = userData.notifPush || false;
	document.getElementById('notif-frequency').value = userData.notifFrequency || '즉시';
	document.getElementById('notif-category').value = userData.notifCategory || '전체';

	// 다크모드 로컬저장
	document.getElementById('dark-mode-toggle').checked = localStorage.getItem('dark-mode') === 'true';
}

// 이름 수정
const editNameBtn = document.getElementById('edit-name-btn');
editNameBtn.addEventListener('click', async () => {
	const newName = prompt('새 이름을 입력하세요:');
	if (!newName) return;
	await setDoc(doc(db, 'users', currentUser.uid), { name: newName }, { merge: true });
	document.getElementById('user-name').textContent = newName;
});

// 주소 수정
const editAddressBtn = document.getElementById('edit-address-btn');
editAddressBtn.addEventListener('click', async () => {
	const newAddr = prompt('새 주소를 입력하세요:');
	if (!newAddr) return;
	await setDoc(doc(db, 'users', currentUser.uid), { address: newAddr }, { merge: true });
	document.getElementById('user-address').textContent = newAddr;
});

// 알림 관련 설정들 저장 (Firestore 반영)
const notifIds = ['notif-rental', 'notif-email', 'notif-push'];
notifIds.forEach((id) => {
	const el = document.getElementById(id);
	el.addEventListener('change', async () => {
		const update = {};
		update[id.replace('notif-', 'notif').replace('-', '')] = el.checked;
		await setDoc(doc(db, 'users', currentUser.uid), update, { merge: true });
	});
});

// 이메일 알림 주기 및 카테고리 설정
['notif-frequency', 'notif-category'].forEach((id) => {
	const el = document.getElementById(id);
	el.addEventListener('change', async () => {
		const update = {};
		update[id.replace('notif-', 'notif')] = el.value;
		await setDoc(doc(db, 'users', currentUser.uid), update, { merge: true });
	});
});

// 다크 모드 토글
const darkToggle = document.getElementById('dark-mode-toggle');
darkToggle.addEventListener('change', () => {
	localStorage.setItem('dark-mode', darkToggle.checked);
	document.body.classList.toggle('dark', darkToggle.checked);
});

// 비밀번호 변경
const changePwBtn = document.getElementById('change-password-btn');
changePwBtn.addEventListener('click', async () => {
	const newPw = prompt('새 비밀번호를 입력하세요 (6자 이상):');
	if (!newPw || newPw.length < 6) return alert('비밀번호는 6자 이상이어야 합니다.');
	try {
		await updatePassword(currentUser, newPw);
		alert('비밀번호가 변경되었습니다.');
	} catch (e) {
		console.error(e);
		alert('비밀번호 변경 중 오류 발생. 재로그인 후 시도해주세요.');
	}
});

// 로그아웃
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
	await signOut(auth);
	window.location.href = 'index.html';
});

// 회원 탈퇴
const deleteAccountBtn = document.getElementById('delete-account-btn');
deleteAccountBtn.addEventListener('click', async () => {
	if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
	try {
		await deleteUser(currentUser);
		alert('계정이 삭제되었습니다.');
		window.location.href = 'index.html';
	} catch (error) {
		console.error(error);
		alert('계정 삭제 실패: 다시 로그인 후 시도해 주세요.');
	}
});

async function sendTestEmail() {
	const res = await fetch('http://localhost:3000/send-email', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			to: currentUser.email,
			subject: '설정 테스트 이메일',
			text: '알림 기능 테스트입니다!',
		}),
	});

	const text = await res.text();
	alert(text);
}

document.getElementById('send-test-email-btn').addEventListener('click', sendTestEmail);
