// screens/RentalRequests.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RentalRequests = () => {
	const [requests, setRequests] = useState([]);

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchRequests = async () => {
		try {
			const userId = await AsyncStorage.getItem('userId');
			const q = query(collection(db, 'rentals'), where('ownerId', '==', userId), orderBy('timestamp', 'desc'));
			const snapshot = await getDocs(q);

			const results = [];
			for (const docSnap of snapshot.docs) {
				const rental = docSnap.data();
				const itemSnap = await getDoc(doc(db, 'items', rental.itemId));
				const item = itemSnap.exists() ? itemSnap.data() : { name: '알 수 없음', description: '' };
				results.push({ id: docSnap.id, ...rental, item });
			}

			setRequests(results);
		} catch (err) {
			console.error('요청 목록 불러오기 실패:', err);
		}
	};

	const handleUpdateStatus = async (rentalId, status) => {
		try {
			await updateDoc(doc(db, 'rentals', rentalId), { status });
			Alert.alert('성공', `요청이 '${status}'로 변경되었습니다.`);
			fetchRequests(); // 갱신
		} catch (err) {
			console.error('상태 업데이트 실패:', err);
			Alert.alert('오류', '상태 변경에 실패했습니다.');
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>📩 받은 대여 요청</Text>
			{requests.length === 0 ? (
				<Text style={{ marginTop: 20 }}>받은 요청이 없습니다.</Text>
			) : (
				requests.map((req) => (
					<View key={req.id} style={styles.card}>
						<Text style={styles.name}>{req.item.name}</Text>
						<Text>{req.item.description}</Text>
						<Text>요청자: {req.requesterId}</Text>
						<Text>상태: {req.status === 'pending' ? '대기중' : req.status === 'accepted' ? '수락됨' : '거절됨'}</Text>
						{req.status === 'pending' && (
							<View style={styles.buttonGroup}>
								<Button title='수락' onPress={() => handleUpdateStatus(req.id, 'accepted')} />
								<Button title='거절' color='red' onPress={() => handleUpdateStatus(req.id, 'rejected')} />
							</View>
						)}
					</View>
				))
			)}
		</ScrollView>
	);
};

export default RentalRequests;

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingBottom: 100,
		alignItems: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	card: {
		width: '100%',
		backgroundColor: '#f1f1f1',
		padding: 15,
		borderRadius: 10,
		marginBottom: 15,
	},
	name: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	buttonGroup: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
});
