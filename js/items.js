// 아이템 추가
document.getElementById('add-item-btn').addEventListener('click', function () {
	const itemName = document.getElementById('item-name').value;
	const itemDescription = document.getElementById('item-description').value;
	const user = auth.currentUser;

	document.addEventListener('DOMContentLoaded', function () {
		document.getElementById('some-button').addEventListener('click', function () {
			console.log('버튼 클릭됨!');
		});
	});

	if (!itemName || !itemDescription) {
		alert('아이템 이름, 설명을 입력하세요!');
		return;
	}
	if (itemName.length < 3 || itemDescription.length < 10) {
		alert('아이템 이름, 설명은 3��자 이상, 10��자 이상으로 입력하세요!');
		return;
	}
	if (!/^[a-zA-Z0-9 ]+$/.test(itemName) || !/^[a-zA-Z0-9\s.,!?]+$/.test(itemDescription)) {
		alert('아이템 이름, 설명은 영문, 숫자, 공, 특수문자(!@#$%^&*()-_=+[{]};:,.<>/?)만 입력하세요!');
		return;
	}

	if (user) {
		db.collection('items')
			.add({
				userId: user.uid,
				name: itemName,
				description: itemDescription,
				timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			})
			.then(() => {
				alert('아이템 추가 완료!');
				document.getElementById('item-name').value = '';
				document.getElementById('item-description').value = '';
				loadItems();
			});
	}
});

// 아이템 목록 불러오기
function loadItems() {
	const user = auth.currentUser;
	if (user) {
		db.collection('items')
			.where('userId', '==', user.uid)
			.orderBy('timestamp', 'desc')
			.onSnapshot((snapshot) => {
				const itemList = document.getElementById('item-list');
				itemList.innerHTML = '';
				snapshot.forEach((doc) => {
					const item = doc.data();
					const li = document.createElement('li');
					li.textContent = `${item.name} - ${item.description}`;
					itemList.appendChild(li);
				});
			});
	}
}
