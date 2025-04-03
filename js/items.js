// DOM이 모두 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
	const addItemBtn = document.getElementById('add-item-btn');
	const itemNameInput = document.getElementById('item-name');
	const itemDescriptionInput = document.getElementById('item-description');
	const itemList = document.getElementById('item-list');

	// add-item-btn가 있는 경우에만 이벤트 등록
	if (addItemBtn) {
		addItemBtn.addEventListener('click', function () {
			const itemName = itemNameInput.value;
			const itemDescription = itemDescriptionInput.value;
			const user = auth.currentUser;

			if (!itemName || !itemDescription) {
				alert('아이템 이름, 설명을 입력하세요!');
				return;
			}
			if (itemName.length < 3 || itemDescription.length < 10) {
				alert('아이템 이름, 설명은 3자 이상, 10자 이상으로 입력하세요!');
				return;
			}
			if (!/^[a-zA-Z0-9 ]+$/.test(itemName) || !/^[a-zA-Z0-9\s.,!?]+$/.test(itemDescription)) {
				alert('아이템 이름, 설명은 영문, 숫자, 공백, 특수문자(!@#$%^&*()-_=+[{]};:,.<>/?)만 입력하세요!');
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
						itemNameInput.value = '';
						itemDescriptionInput.value = '';
						loadItems();
					});
			}
		});
	}

	// (선택) 예시: some-button 이벤트도 이 안에서 처리
	const someButton = document.getElementById('some-button');
	if (someButton) {
		someButton.addEventListener('click', function () {
			console.log('버튼 클릭됨!');
		});
	}
});
