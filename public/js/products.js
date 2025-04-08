import { db, auth } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const productList = document.getElementById('product-list');

// 상품 등록 버튼 생성
const topBar = document.createElement('div');
topBar.style.display = 'flex';
topBar.style.justifyContent = 'space-between';
topBar.style.alignItems = 'center';
topBar.style.marginBottom = '1rem';

const title = document.createElement('h2');
title.textContent = '전체 상품 목록';

const addBtn = document.createElement('button');
addBtn.textContent = '상품 등록';
addBtn.style.padding = '0.5rem 1rem';
addBtn.style.fontSize = '0.9rem';
addBtn.style.cursor = 'pointer';

topBar.appendChild(title);
topBar.appendChild(addBtn);
productList.before(topBar);

// 검색창 생성
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = '상품명 검색';
searchInput.id = 'search-input';
searchInput.style.marginBottom = '1rem';
searchInput.style.padding = '0.5rem';
searchInput.style.fontSize = '1rem';
searchInput.style.width = '100%';
productList.before(searchInput);

let allItems = [];
let currentUser = null;

onAuthStateChanged(auth, (user) => {
	currentUser = user;
});

addBtn.addEventListener('click', () => {
	if (!currentUser) {
		alert('상품 등록은 로그인 후 이용 가능합니다.');
		window.location.href = 'login.html';
	} else {
		window.location.href = 'add-item.html';
	}
});

// Firestore에서 전체 아이템 불러오기
async function loadProducts() {
	productList.innerHTML = '';
	const q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));
	const snapshot = await getDocs(q);
	allItems = [];

	snapshot.forEach((doc) => {
		const item = doc.data();
		item.id = doc.id;
		allItems.push(item);
	});

	renderItems(allItems);
}

// 상품 렌더링
function renderItems(items) {
	productList.innerHTML = '';
	items.forEach((item) => {
		const div = document.createElement('div');
		div.className = 'item-card';
		div.style.cursor = 'pointer';
		div.addEventListener('click', () => {
			window.location.href = `item-detail.html?id=${item.id}`;
		});

		div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}" />` : ''}
    `;
		productList.appendChild(div);
	});
}

// 검색 기능
searchInput.addEventListener('input', () => {
	const keyword = searchInput.value.toLowerCase();
	const filtered = allItems.filter((item) => item.name.toLowerCase().includes(keyword));
	renderItems(filtered);
});

loadProducts();
