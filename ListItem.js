// ListItems.js
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ListItems = () => {
	const [items, setItems] = useState([]);

	useEffect(() => {
		const fetchItems = async () => {
			const itemsCollection = collection(db, 'rentedItems');
			const itemsSnapshot = await getDocs(itemsCollection);
			const itemsList = itemsSnapshot.docs.map((doc) => doc.data());
			setItems(itemsList);
		};

		fetchItems();
	}, []);

	return (
		<div className='container'>
			<h2>대여된 물건들</h2>
			{items.length === 0 ? (
				<p>대여된 물건이 없습니다.</p>
			) : (
				<ul>
					{items.map((item, index) => (
						<li key={index}>
							<h3>{item.name}</h3>
							<p>{item.description}</p>
							<p>가격: {item.price}원</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default ListItems;
