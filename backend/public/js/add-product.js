// add-product.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('product-form');
	const nameInput = document.getElementById('name');
	const descInput = document.getElementById('description');
	const imageUrlInput = document.getElementById('image-url');
	const imageFileInput = document.getElementById('image-file');
	const preview = document.getElementById('preview');

	let currentUser = null;

	// 로그인 상태 확인
	onAuthStateChanged(auth, (user) => {
		if (!user) {
			alert('로그인이 필요합니다.');
			window.location.href = 'login.html';
		} else {
			currentUser = user;
		}
	});

	// 로컬 이미지 미리보기 처리
	imageFileInput.addEventListener('change', () => {
		const file = imageFileInput.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				preview.src = e.target.result;
				preview.style.display = 'block';
			};
			reader.readAsDataURL(file);
		} else {
			preview.src = '';
			preview.style.display = 'none';
		}
	});

	// 상품 등록
	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const name = nameInput.value.trim();
		const description = descInput.value.trim();
		const imageURL = imageUrlInput.value.trim() || (preview.style.display !== 'none' ? preview.src : '');

		if (!name || !description) {
			alert('상품 이름과 설명을 입력해주세요.');
			return;
		}

		try {
			await addDoc(collection(db, 'items'), {
				name,
				description,
				imageURL,
				userId: currentUser.uid,
				timestamp: serverTimestamp(),
			});

			alert('상품이 등록되었습니다!');
			window.location.href = 'index.html';
		} catch (error) {
			console.error('상품 등록 오류:', error);
			alert('상품 등록에 실패했습니다.');
		}
	});
});
