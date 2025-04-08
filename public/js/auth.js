// auth.js (회원가입 + 로그인 처리)
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
	const signupForm = document.getElementById('signup-form');
	const loginForm = document.getElementById('login-form');

	// ✅ 회원가입 처리
	if (signupForm) {
		signupForm.addEventListener('submit', async (e) => {
			e.preventDefault();

			const name = document.getElementById('signup-name').value.trim();
			const email = document.getElementById('signup-email').value.trim();
			const password = document.getElementById('signup-password').value;
			const zipcode = document.getElementById('signup-zipcode').value.trim();
			const address = document.getElementById('signup-address').value.trim();

			if (!name || !email || !password || !zipcode || !address) {
				alert('모든 필드를 입력해주세요!');
				return;
			}

			try {
				const userCredential = await createUserWithEmailAndPassword(auth, email, password);
				const user = userCredential.user;

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
	}

	// ✅ 로그인 처리
	if (loginForm) {
		loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();

			const email = document.getElementById('login-email').value.trim();
			const password = document.getElementById('login-password').value;

			if (!email || !password) {
				alert('이메일과 비밀번호를 입력하세요!');
				return;
			}

			try {
				await signInWithEmailAndPassword(auth, email, password);
				alert('로그인 성공!');
				window.location.href = 'index.html';
			} catch (error) {
				console.error('로그인 오류:', error);
				alert('로그인 실패: ' + error.message);
			}
		});
	}
});
