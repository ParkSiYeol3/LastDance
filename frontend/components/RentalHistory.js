// components/RentalHistory.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../firebase-config';
import { formatTimestamp } from '../utils/formatTimestamp';

const RentalHistory = ({ itemId }) => {
	const [history, setHistory] = useState([]);

	useEffect(() => {
		fetchRentalHistory();
	}, []);

	const fetchRentalHistory = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/items/${itemId}/rentals`);
			setHistory(res.data.rentals);
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
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.entry}>
						<Text style={styles.text}>
							요청자: {item.requesterId} / 상태: {item.status}
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
		paddingVertical: 6,
		borderBottomWidth: 1,
		borderColor: '#eee',
	},
	text: {
		fontSize: 14,
	},
	dateText: {
		fontSize: 12,
		color: '#888',
	},
});
