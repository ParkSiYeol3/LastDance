// RentItem.js
import React, { useState } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const RentItem = () => {
	const [itemName, setItemName] = useState('');
	const [itemDescription, setItemDescription] = useState('');
	const [itemPrice, setItemPrice] = useState('');
	const [error, setError] = useState('');

	const handleRentItem = async (e) => {
		e.preventDefault();
		if (!auth.currentUser) {
			setError('로그인이 필요합니다.');
			return;
		}

		try {
			const itemRef = collection(db, 'rentedItems');
			await addDoc(itemRef, {
				name: itemName,
				description: itemDescription,
				price: itemPrice,
				userId: auth.currentUser.uid, // 현재 로그인된 사용자 ID
				createdAt: new Date(),
			});
			alert('물건 등록 성공!');
			setItemName('');
			setItemDescription('');
			setItemPrice('');
		} catch (err) {
			setError('물건 등록 실패: ' + err.message);
		}
	};

	return (
		<div className='container'>
			<h2>대여할 물건 등록</h2>
			<form onSubmit={handleRentItem}>
				<input type='text' placeholder='물건 이름' value={itemName} onChange={(e) => setItemName(e.target.value)} required />
				<textarea placeholder='물건 설명' value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} required />
				<input type='number' placeholder='대여 가격' value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} required />
				<button type='submit'>물건 등록</button>
			</form>
			{error && <p>{error}</p>}
		</div>
	);
};

export default RentItem;
