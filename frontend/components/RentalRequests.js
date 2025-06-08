// screens/RentalRequests.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db, API_URL } from '../firebase-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth'; // ✅ Firebase Auth 추가
import Footer from './Footer';

const RentalRequests = () => {
	const [requests, setRequests] = useState([]);
	const navigation = useNavigation();

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
				const userSnap = await getDoc(doc(db, 'users', rental.requesterId));
				const requesterName = userSnap.exists() ? userSnap.data().name : rental.requesterId;

				results.push({ id: docSnap.id, ...rental, item, requesterName });
			}

			setRequests(results);
		} catch (err) {
			console.error('요청 목록 불러오기 실패:', err);
		}
	};

	const handleUpdateStatus = async (rentalId, status, requesterId, itemId) => {
		try {
			await updateDoc(doc(db, 'rentals', rentalId), { status });

			const ownerId = await AsyncStorage.getItem('userId');
			const auth = getAuth();
			const user = auth.currentUser;

			if (!user) {
				Alert.alert('오류', '로그인 상태가 아닙니다.');
				return;
			}

			const token = await user.getIdToken(true);

			// 📢 알림 전송 (수락 or 거절 공통)
			if (status === 'accepted') {
				await axios.post(`${API_URL}/api/notifications/send`, {
					userId: requesterId,
					title: '📦 대여 요청이 수락되었습니다!',
					message: '요청이 수락되었어요. 채팅을 통해 거래를 진행해보세요.',
				});
			} else if (status === 'rejected') {
				await axios.post(`${API_URL}/api/notifications/send`, {
					userId: requesterId,
					title: '❌ 대여 요청이 거절되었습니다',
					message: '안타깝게도 요청이 거절되었어요. 다른 상품도 살펴보세요!',
				});
			}

			// ✅ 채팅 시작 및 안내 메시지 (수락 시에만)
			if (status === 'accepted') {
				const res = await axios.post(
					`${API_URL}/api/chat/start`,
					{
						userId1: requesterId,
						userId2: ownerId,
						rentalItemId: itemId,
					},
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				const { chatRoomId } = res.data;

				await axios.post(`${API_URL}/api/chat/${chatRoomId}/auto-message`, {
					text: '대여 요청을 수락했습니다. 편하게 대화 나눠보세요!',
					senderId: ownerId,
				});

				Alert.alert('수락 완료', '채팅방으로 이동합니다.');
				navigation.navigate('ChatRoom', { roomId: chatRoomId });
			} else {
				Alert.alert('완료', `요청이 '${status}'로 처리되었습니다.`);
				fetchRequests(); // 요청 목록 다시 불러오기
			}
		} catch (err) {
			console.error('상태 업데이트 또는 채팅 시작 실패:', err);
			Alert.alert('오류', '상태 변경 또는 채팅 연결 실패');
		}
	};

	return (
		<>
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>📩 받은 대여 요청</Text>
			{requests.length === 0 ? (
				<Text style={{ marginTop: 20 }}>받은 요청이 없습니다.</Text>
			) : (
				requests.map((req) => (
					<View key={req.id} style={styles.card}>
						<Text style={styles.name}>{req.item.name}</Text>
						<Text>{req.item.description}</Text>
						<Text>요청자: {req.requesterName}</Text>
						<Text>상태: {req.status === 'pending' ? '대기중' : req.status === 'accepted' ? '수락됨' : '거절됨'}</Text>
						{req.status === 'pending' && (
							<View style={styles.buttonGroup}>
								<Button title='수락' onPress={() => handleUpdateStatus(req.id, 'accepted', req.requesterId, req.itemId)} />
								<Button title='거절' color='red' onPress={() => handleUpdateStatus(req.id, 'rejected', req.requesterId, req.itemId)} />
							</View>
						)}
					</View>
				))
			)}
		</ScrollView>

		<View style={styles.footer}>
			<Footer navigation={navigation} />
		</View>
		</>
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
	footer: {
		position: 'absolute',
		bottom: 0,
		height: 83,
		width: '100%',
	},
});
