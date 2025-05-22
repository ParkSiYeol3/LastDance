// components/RentalHistory.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert} from 'react-native';
import axios from 'axios';
import { API_URL, db } from '../firebase-config';
import { formatTimestamp } from '../utils/formatTimestamp';
import { doc, getDoc } from 'firebase/firestore';

const RentalHistory = ({ itemId }) => {
	const [history, setHistory] = useState([]);

	useEffect(() => {
		fetchRentalHistory();
	}, []);

	const fetchRentalHistory = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/items/${itemId}/rentals`);
			const rentals = res.data.rentals;

			// 각 요청자 이름을 병합하여 새로운 리스트로 구성
			const enriched = await Promise.all(
				rentals.map(async (rental) => {
					const userSnap = await getDoc(doc(db, 'users', rental.requesterId));
					const requesterName = userSnap.exists() ? userSnap.data().name : rental.requesterId;
					return { ...rental, requesterName };
				})
			);

			setHistory(enriched);
		} catch (err) {
			console.error('대여 기록 로딩 실패:', err);
			Alert.alert('오류', '대여 기록을 불러오지 못했습니다.');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>📜 대여 기록</Text>
			<FlatList
				data={history}
				scrollEnabled={false}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.entry}>
						<Text style={styles.text}>
							요청자: {item.requesterName} / 상태: {item.status}
						</Text>
						<Text style={styles.dateText}>요청 시각: {formatTimestamp(item.timestamp)}</Text>
					</View>
				)}
			/>
		</View>
	);
};

export default RentalHistory;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  entry: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
});