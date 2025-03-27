// 아이템 추가
document.getElementById('add-item-btn').addEventListener('click', function () {
	const itemName = document.getElementById('item-name').value;
	const itemDescription = document.getElementById('item-description').value;
	const user = auth.currentUser;

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
