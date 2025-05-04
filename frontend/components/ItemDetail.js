import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../firebase-config';
import CommentSection from '../components/CommentSection';

const ItemDetail = () => {
	const route = useRoute();
	const navigation = useNavigation();
	const { itemId } = route.params;

	const [item, setItem] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const [itemOwnerName, setItemOwnerName] = useState('');
	const [rentalRequested, setRentalRequested] = useState(false);

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
			// 백엔드가 item + itemOwnerName 을 같이 내려준다고 가정
			const res = await axios.get(`${API_URL}/api/items/${itemId}`);
			setItem(res.data.item);
			setItemOwnerName(res.data.itemOwnerName); // <-- 이제 여기서 바로 설정
		} catch (err) {
			console.error('아이템 불러오기 실패:', err);
			Alert.alert('오류', '아이템 정보를 불러올 수 없습니다.');
		}
	};

	const handleRentalRequest = async () => {
		try {
			const token = await AsyncStorage.getItem('accessToken');
			const headers = { Authorization: `Bearer ${token}` };
			await axios.post(`${API_URL}/api/items/${itemId}/rentals`, { requesterId: currentUser.uid, ownerId: item.userId }, { headers });
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

	const isOwner = currentUser?.uid === item?.userId;

	// 로딩 처리
	if (!item) {
		return (
			<View style={styles.center}>
				<Text>로딩 중...</Text>
			</View>
		);
	}

	// 실제 UI
	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>{item.name}</Text>
			{item.imageURL && <Image source={{ uri: item.imageURL }} style={styles.image} />}
			<Text style={styles.description}>{item.description}</Text>
			<Text style={styles.ownerText}>게시자: {itemOwnerName}</Text>

			<View style={styles.buttonGroup}>
				{isOwner ? <Button title='본인의 물품' disabled /> : <Button title={rentalRequested ? '요청됨!' : '대여 요청하기'} onPress={handleRentalRequest} disabled={rentalRequested} />}
			</View>

			{isOwner && (
				<View style={styles.deleteButton}>
					<Button title='상품 삭제' color='red' onPress={handleDelete} />
				</View>
			)}
			<CommentSection itemId={itemId} currentUser={currentUser} />
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
	deleteButton: {
		width: '80%',
		marginTop: 10,
	},
});
