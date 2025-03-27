import { auth, db } from './firebase-config.js'; // Firebase 모듈 가져오기
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

// 회원가입 이벤트
document.getElementById('signup-btn').addEventListener('click', async function () {
	const name = document.getElementById('signup-name').value;
	const email = document.getElementById('signup-email').value;
	const password = document.getElementById('signup-password').value;
	const zipcode = document.getElementById('signup-zipcode').value;
	const address = document.getElementById('signup-address').value;

	if (!email || !password || !name || !zipcode || !address) {
		alert('모든 필드를 입력해주세요!');
		return;
	}

	try {
		// Firebase 회원가입
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		// Firestore에 사용자 정보 저장
		await setDoc(doc(db, 'users', user.uid), {
			name,
			email,
			zipcode,
			address,
		});

		alert('회원가입 완료! 로그인 해주세요.');
		window.location.href = 'login.html';
	} catch (error) {
		console.error('회원가입 오류:', error);
		alert('회원가입 실패: ' + error.message);
	}
});
