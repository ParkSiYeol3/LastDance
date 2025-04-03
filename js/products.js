// products.js
import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const productList = document.getElementById('product-list');

// 검색창 생성
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = '상품명 검색';
searchInput.id = 'search-input';
searchInput.style.marginBottom = '1rem';
productList.before(searchInput);

let allItems = [];

// Firestore에서 전체 아이템 불러오기
async function loadProducts() {
	productList.innerHTML = '';
	const q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));
	const snapshot = await getDocs(q);
	allItems = [];

	snapshot.forEach((doc) => {
		const item = doc.data();
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
