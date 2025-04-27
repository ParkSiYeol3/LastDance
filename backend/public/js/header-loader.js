// header-loader.js
export async function loadHeader() {
	const container = document.getElementById('header-container');
	if (!container) return;

	// 헤더 HTML 불러오기
	const res = await fetch('header.html');
	const html = await res.text();
	container.innerHTML = html;

	// 초기 숨김 처리
	const authElements = document.querySelectorAll('.auth-toggle');
	authElements.forEach((el) => (el.style.display = 'none'));

	const logoutBtn = document.getElementById('logout-btn');
	const loginLink = document.getElementById('login-link');

	const { auth } = await import('./firebase-config.js');
	const { onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js');

	onAuthStateChanged(auth, (user) => {
		if (user) {
			logoutBtn.style.display = 'inline-block';
			loginLink.style.display = 'none';
		} else {
			logoutBtn.style.display = 'none';
			loginLink.style.display = 'inline-block';
		}
	});

	logoutBtn?.addEventListener('click', async () => {
		await signOut(auth);
		window.location.href = 'index.html';
	});
}
