import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../firebase-config';
import CommentSection from '../components/CommentSection';
import RentalHistory from '../components/RentalHistory';
import EditItemForm from '../components/EditItemForm';
import { getAuth } from 'firebase/auth';

const ItemDetail = () => {
	const route = useRoute();
	const navigation = useNavigation();
	const { itemId } = route.params;

	const [item, setItem] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const [itemOwnerName, setItemOwnerName] = useState('');
	const [rentalRequested, setRentalRequested] = useState(false);
	const [editing, setEditing] = useState(false);
	const [loadingChat, setLoadingChat] = useState(false);

	useEffect(() => {
		loadUserAndItem();
	}, []);

	const loadUserAndItem = async () => {
		try {
			const userJson = await AsyncStorage.getItem('currentUser');
			if (userJson) setCurrentUser(JSON.parse(userJson));
			await fetchItem();
		} catch (error) {
			console.error('유저 정보 로딩 오류:', error);
		}
	};

	const fetchItem = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/items/${itemId}`);
			setItem(res.data.item);
			setItemOwnerName(res.data.itemOwnerName);
		} catch (err) {
			console.error('아이템 불러오기 실패:', err);
			Alert.alert('오류', '아이템 정보를 불러올 수 없습니다.');
		}
	};

	const handleRentalRequest = async () => {
		try {
			const token = await AsyncStorage.getItem('accessToken');
			const headers = { Authorization: `Bearer ${token}` };
			await axios.post(
				`${API_URL}/api/items/${itemId}/rentals`,
				{
					requesterId: currentUser.uid,
					ownerId: item.userId,
				},
				{ headers }
			);
			setRentalRequested(true);
		} catch (error) {
			console.error('대여 요청 오류:', error.response || error);
			Alert.alert('오류', '대여 요청에 실패했습니다.');
		}
	};

	const handleDelete = async () => {
		if (!currentUser) {
			Alert.alert('로그인 필요', '삭제하려면 로그인해야 합니다.');
			return;
		}
		Alert.alert('경고', '정말로 이 상품을 삭제하시겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				style: 'destructive',
				onPress: async () => {
					try {
						const token = await AsyncStorage.getItem('accessToken');
						await axios.delete(`${API_URL}/api/items/${itemId}`, {
							headers: { Authorization: `Bearer ${token}` },
						});
						Alert.alert('삭제 완료', '상품이 삭제되었습니다.');
						navigation.goBack();
					} catch (err) {
						console.error('상품 삭제 실패:', err);
						Alert.alert('오류', '상품 삭제 실패');
					}
				},
			},
		]);
	};

	const handleStartChat = async () => {
		const auth = getAuth();
		const user = auth.currentUser;

		if (!user) {
			Alert.alert('로그인 필요', '채팅을 시작하려면 로그인해야 합니다.');
			return;
		}

		try {
			const token = await user.getIdToken(true); // ← 이 괄호까지 꼭 닫혀야 함

			const res = await axios.post(
				`${API_URL}/api/chat/start`,
				{
					userId1: user.uid,
					userId2: item.userId,
					rentalItemId: itemId,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			const { chatRoomId } = res.data;
			navigation.navigate('ChatRoom', { chatRoomId });
		} catch (error) {
			console.error('채팅방 생성 오류:', error);
			Alert.alert('오류', '채팅방 생성에 실패했습니다.');
		}
	};

	const isOwner = currentUser?.uid === item?.userId;

	if (!item) {
		return (
			<View style={styles.center}>
				<Text>로딩 중...</Text>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>{item.name}</Text>
			{item.imageURL && <Image source={{ uri: item.imageURL }} style={styles.image} />}
			<Text style={styles.description}>{item.description}</Text>
			<Text style={styles.ownerText}>게시자: {itemOwnerName}</Text>

			{!editing && (
				<View style={styles.buttonGroup}>
					{isOwner ? <Button title='본인의 물품' disabled /> : <Button title={rentalRequested ? '요청됨!' : '대여 요청하기'} onPress={handleRentalRequest} disabled={rentalRequested} />}
				</View>
			)}

			{isOwner && !editing && (
				<View style={styles.editButton}>
					<Button title='상품 수정' onPress={() => setEditing(true)} />
				</View>
			)}

			{isOwner && (
				<View style={styles.deleteButton}>
					<Button title='상품 삭제' color='red' onPress={handleDelete} />
				</View>
			)}
			{!isOwner && (
				<View style={styles.buttonGroup}>
					<Button title={loadingChat ? '채팅 연결 중...' : '채팅하기'} onPress={handleStartChat} disabled={loadingChat} />
				</View>
			)}

			{editing && (
				<EditItemForm
					item={{ id: itemId, ...item }}
					onCancel={() => setEditing(false)}
					onSuccess={async () => {
						setEditing(false);
						await fetchItem();
					}}
				/>
			)}

			<CommentSection itemId={itemId} currentUser={currentUser} />
			<RentalHistory itemId={itemId} />
		</ScrollView>
	);
};

export default ItemDetail;

const styles = StyleSheet.create({
	container: {
		padding: 20,
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	image: {
		width: 250,
		height: 250,
		borderRadius: 10,
		marginBottom: 20,
	},
	description: {
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 20,
	},
	ownerText: {
		fontSize: 14,
		marginBottom: 20,
		color: '#777',
	},
	buttonGroup: {
		width: '80%',
		marginBottom: 10,
	},
	editButton: {
		width: '80%',
		marginBottom: 10,
	},
	deleteButton: {
		width: '80%',
		marginTop: 10,
	},
});
