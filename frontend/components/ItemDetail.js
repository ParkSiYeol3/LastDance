import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { collection, doc, addDoc, query, where, getDoc, getDocs, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, db } from '../firebase-config';
import CommentSection from './CommentSection';
import RentalHistory from './RentalHistory';
import EditItemForm from './EditItemForm';
import { getAuth } from 'firebase/auth';
import * as Location from 'expo-location';
import Footer from './Footer';
import BlackHeart from '../assets/blackHeart.png';
import BIN_blackHeart from '../assets/BIN_blackHeart.png';

const ItemDetail = () => {
	const route = useRoute();
	const navigation = useNavigation();
	const { itemId } = route.params || {};

	const [item, setItem] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const [itemOwnerName, setItemOwnerName] = useState('');
	const [itemOwnerProfile, setItemOwnerProfile] = useState(null);
	const [rentalRequested, setRentalRequested] = useState(false);
	const [editing, setEditing] = useState(false);
	const [loadingChat, setLoadingChat] = useState(false);
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(0);
	const [distanceFromMe, setDistanceFromMe] = useState(null);
	
	useEffect(() => {
		const fetchDistance = async () => {
    		if (!item?.latitude || !item?.longitude) return;

    		const { status } = await Location.requestForegroundPermissionsAsync();
    		if (status !== 'granted') return;

    		const current = await Location.getCurrentPositionAsync({});
    		const dist = getDistance(
      			current.coords.latitude,
      			current.coords.longitude,
      			item.latitude,
      			item.longitude
    		);
    		setDistanceFromMe(dist.toFixed(1));
  		};

  		fetchDistance();
	}, [item]);

	useEffect(() => {
		if (!itemId) {
			Alert.alert('오류', '아이템 정보가 잘못되었습니다.');
			navigation.goBack();
			return;
		}
		loadUserAndItem(); // 내부에서 logRecentView 처리
	}, [itemId]);

	const getDistance = (lat1, lon1, lat2, lon2) => {
		const R = 6371;
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) ** 2;
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const loadUserAndItem = async () => {
		try {
			const userJson = await AsyncStorage.getItem('currentUser');
			if (!userJson) {
				console.log('❌ currentUser 없음');
				return;
			}
			const user = JSON.parse(userJson);
			if (!user?.uid) {
				console.log('❌ user.uid 없음');
				return;
			}
			setCurrentUser(user);
			console.log('✅ user 로드 완료:', user.uid);

			await fetchItem();
			if (user?.uid) {
				await fetchItemStatus(user.uid);
				await logRecentView(user.uid);
			}

			// 🧭 내 위치와 상품 거리 계산
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status === 'granted') {
				const current = await Location.getCurrentPositionAsync({});
					if (item?.latitude && item?.longitude) {
						const dist = getDistance(
							current.coords.latitude,
							current.coords.longitude,
							item.latitude,
							item.longitude
						);
						setDistanceFromMe(dist.toFixed(1)); // 1.8km 식으로
					}
			}
		} catch (error) {
			console.error('유저 정보 로딩 오류:', error);
		}
	};

	const checkExistingRequest = async (userId) => {
		try {
			const rentalRef = collection(db, 'rentalRequests');
			const q = query(rentalRef, where('itemId', '==', itemId), where('requesterId', '==', userId), where('status', '==', 'pending'));
			const snapshot = await getDocs(q);

			if (!snapshot.empty) {
				console.log('✅ 이미 대여 요청한 상태');
				setRentalRequested(true);
			} else {
				setRentalRequested(false); // 이게 누락되어 있으면 계속 true로 남아 있음
			}
		} catch (err) {
			console.error('요청 상태 확인 실패:', err);
		}
	};

	const logRecentView = async (uid) => {
		if (!uid || !itemId) {
			console.warn('logRecentView: uid 또는 itemId 누락');
			return;
		}
		try {
			const recentRef = collection(db, 'recentViews');
			const existingQuery = query(recentRef, where('userId', '==', uid), where('itemId', '==', itemId));
			const snapshot = await getDocs(existingQuery);
			snapshot.forEach(async (docSnap) => {
				await deleteDoc(docSnap.ref);
			});
			await addDoc(recentRef, {
				userId: uid,
				itemId,
				viewedAt: new Date(), // 또는 serverTimestamp()
			});
			console.log(`최근 본 상품 기록 완료: ${uid} - ${itemId}`);
		} catch (error) {
			console.error('최근 본 상품 기록 실패:', error);
		}
	};

	const fetchItem = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/items/${itemId}`);
			const fetched = res.data?.item ?? null;
			setItem(fetched);
			setItemOwnerName(res.data?.itemOwnerName ?? '');
			if (fetched?.userId) await fetchOwnerProfile(fetched.userId);
		} catch (err) {
			console.error('아이템 불러오기 실패:', err);
			Alert.alert('오류', '아이템 정보를 불러올 수 없습니다.');
		}
	};

	const fetchItemStatus = async (userId) => {
		try {
			const itemRef = doc(db, 'items', itemId);
			const itemSnap = await getDoc(itemRef);
			if (itemSnap.exists()) {
				const likedBy = itemSnap.data().likedBy || [];
				setLiked(likedBy.includes(userId));
				setLikeCount(likedBy.length);
			} else {
				setLiked(false);
			}
		} catch (error) {
			console.error('좋아요 상태 확인 실패:', error);
		}
	};

	const fetchOwnerProfile = async (ownerId) => {
		try {
			const res = await axios.get(`${API_URL}/api/users/${ownerId}`);
			setItemOwnerProfile(res.data);
		} catch (err) {
			console.error('판매자 프로필 불러오기 실패:', err);
		}
	};

	const toggleLike = async () => {
		if (!currentUser || !itemId) return;

		try {
			const itemRef = doc(db, 'items', itemId);
			const itemSnap = await getDoc(itemRef);

			if (!itemSnap.exists()) {
				console.warn('아이템 문서가 존재하지 않음');
				return;
			}

			const likedBy = itemSnap.data().likedBy || [];
			const isLiked = likedBy.includes(currentUser.uid);
			const updatedLikes = isLiked ? likedBy.filter((uid) => uid !== currentUser.uid) : [...likedBy, currentUser.uid];

			// 1. items 컬렉션 업데이트
			await updateDoc(itemRef, { likedBy: updatedLikes });

			// 2. favorites 컬렉션도 동기화
			const favoritesRef = collection(db, 'favorites');
			const favQuery = query(favoritesRef, where('userId', '==', currentUser.uid), where('itemId', '==', itemId));
			const favSnapshot = await getDocs(favQuery);

			if (isLiked) {
				// 이미 좋아요 → 취소 → favorites 문서 삭제
				favSnapshot.forEach(async (docSnap) => {
					await deleteDoc(docSnap.ref);
				});
			} else {
				// 새로 좋아요 → favorites 문서 추가
				if (favSnapshot.empty) {
					await addDoc(favoritesRef, {
						userId: currentUser.uid,
						itemId: itemId,
						createdAt: new Date(),
					});
				}
			}

			// 상태 반영
			setLiked(!isLiked);
			setLikeCount(updatedLikes.length); 
		} catch (err) {
			console.error('좋아요 처리 실패:', err);
		}
	};

	const handleRentalRequest = async () => {
		if (rentalRequested) {
			console.warn('이미 요청된 상태입니다.');
			return;
		}

		const token = await AsyncStorage.getItem('accessToken');

		// Firestore에 중복 확인
		const rentalRef = collection(db, 'rentalRequests');
		const q = query(rentalRef, where('itemId', '==', itemId), where('requesterId', '==', currentUser.uid), where('status', '==', 'pending'));
		const snapshot = await getDocs(q);
		if (!snapshot.empty) {
			console.log('❌ 중복 요청 방지: 이미 pending 상태 요청 있음');
			setRentalRequested(true);
			return;
		}

		// 1. 대여 요청 등록 (백엔드 or Firestore)
		await axios.post(
			`${API_URL}/api/items/${itemId}/rentals`,
			{
				requesterId: currentUser.uid,
				ownerId: item.userId,
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		// 2. 푸시 알림
		await axios.post(`${API_URL}/api/notifications/send`, {
			userId: item.userId,
			title: '📦 대여 요청이 도착했어요!',
			message: `${currentUser?.nickname || '누군가'}님이 상품을 대여하고 싶어해요.`,
		});

		setRentalRequested(true);
	};

	const handleDelete = async () => {
		Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				style: 'destructive',
				onPress: async () => {
					const token = await AsyncStorage.getItem('accessToken');
					await axios.delete(`${API_URL}/api/items/${itemId}`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					navigation.goBack();
				},
			},
		]);
	};

	const handleStartChat = async () => {
		const user = getAuth().currentUser;
		if (!user) {
			Alert.alert('로그인 필요', '채팅을 시작하려면 로그인하세요.');
			return;
		}

		const token = await user.getIdToken(true);
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

		navigation.navigate('ChatRoom', { roomId: res.data.chatRoomId });
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
		<>
		<ScrollView contentContainerStyle={styles.container} nestedScrollEnabled={true}>
			Add commentMore actions
			<View style={styles.imageBox}>
				{Array.isArray(item.imageURLs) && item.imageURLs.length > 0 ? (
					<ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageSlider}>
						{item.imageURLs.map((url, index) => (
							<Image key={index} source={{ uri: url }} style={styles.image} />
						))}
					</ScrollView>
				) : (
					item.imageURL && <Image source={{ uri: item.imageURL }} style={styles.image} />
				)}
			</View>
			<View style={styles.card}>
				<Text style={styles.title}>{item.name}</Text>
				<Text style={styles.description}>{item.description}</Text>
				{distanceFromMe && (
  					<Text style={styles.distanceText}>👣 회원님의 위치로부터 약 {distanceFromMe}km 떨어져 있습니다.</Text>
				)}
				<View style={styles.iconContainer}>
					<TouchableOpacity onPress={toggleLike}>
						<Image source={liked ? BlackHeart : BIN_blackHeart } style={styles.heartIcon} />
						<Text style={styles.likeCount}>{likeCount}</Text>
					</TouchableOpacity>
				</View>

				{item?.userId && (
					<View style={styles.sellerRow}>
						<Text style={styles.ownerText}>판매자: {itemOwnerName}</Text>
						<TouchableOpacity
							style={styles.reviewButton}
							onPress={() =>
								navigation.navigate('ReviewList', {
									userId: item.userId,
									type: 'received',
								})
							}
						>
							<Text style={styles.reviewButtonText}>후기 보기</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
			{isOwner && (
				<View style={styles.ownerNoticeBox}>
					<Text style={styles.ownerNoticeText}>본인의 물품입니다.</Text>
				</View>
			)}
			{!isOwner && (
				<View style={styles.buttonGroup}>
					<TouchableOpacity style={styles.buttonPrimary} onPress={handleRentalRequest} disabled={rentalRequested}>
						<Text style={styles.buttonText}>{rentalRequested ? '요청됨!' : '대여 요청하기'}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.buttonOutline} onPress={handleStartChat} disabled={loadingChat}>
						<Text style={[styles.buttonText, { color: '#4CAF50' }]}>{loadingChat ? '채팅 연결 중...' : '채팅하기'}</Text>
					</TouchableOpacity>
				</View>
			)}
			{isOwner && !editing && (
				<View style={styles.ownerButtonGroup}>
					<TouchableOpacity style={styles.buttonPrimary} onPress={() => setEditing(true)}>
						<Text style={styles.buttonText}>상품 수정</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.buttonDanger} onPress={handleDelete}>
						<Text style={styles.buttonText}>상품 삭제</Text>
					</TouchableOpacity>
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

		<View style={styles.footer}>
			<Footer navigation={navigation} />
		</View>
	</>	
	);
};
export default ItemDetail;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
	container: { 
		padding: 16, 
		backgroundColor: '#fff', 
		gap: 20 
	},
	center: { 
		flex: 1, 
		justifyContent: 'center', 
		alignItems: 'center' 
	},
	imageBox: { 
		position: 'relative', 
		alignItems: 'center', 
		marginBottom: 10 
	},
	imageSlider: {
		width: '100%',
		height: 320,
		borderRadius: 12,
	},
	image: {
		width: 240,
		height: 240,
		borderRadius: 12,
		marginRight: 12,
		width,
		height: 320,
		resizeMode: 'cover',
	},
	ownerText: {
		fontSize: 14,
		color: '#888',
		fontStyle: 'italic',
	},
	iconContainer: { 
		position: 'absolute', 
		top: 16, 
		right: 16, 
		flexDirection: 'row', 
		gap: 12 
	},
	icon: { 
		fontSize: 24, 
		opacity: 0.4 
	},
	liked: { 
		opacity: 1, 
		color: '#4CAF50' 
	},
	heartIcon: {
  		width: 28,
  		height: 28,
  		tintColor: '#000',
	},
	likeCount: {
  		marginLeft: 9.6,
  		fontSize: 16,
  		color: '#444',
	},
	card: { 
		backgroundColor: '#fff', 
		borderRadius: 12, 
		padding: 16, 
		elevation: 2, 
		gap: 10 
	},
	title: { 
		fontSize: 22, 
		fontWeight: 'bold', 
		color: '#222' 
	},
	description: { 
		fontSize: 16, 
		color: '#444', 
		lineHeight: 22 
	},
	distanceText: {
		marginTop: 2,
		fontSize: 14,
		color: '#777',
	},
	ownerText: { 
		fontSize: 14, 
		color: '#888', 
		fontStyle: 'italic' 
	},
	ownerNoticeBox: {
		marginTop: 6,
		paddingVertical: 10,
		backgroundColor: '#f0f0f0',
		borderRadius: 6,
		alignItems: 'center',
	},
	ownerNoticeText: { 
		color: '#555', 
		fontSize: 14 
	},
	sellerRow: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		justifyContent: 'space-between' 
	},
	reviewButton: { 
		backgroundColor: '#007AFF', 
		paddingVertical: 6, 
		paddingHorizontal: 10, 
		borderRadius: 6 
	},
	reviewButtonText: { 
		color: '#fff', 
		fontSize: 13, 
		fontWeight: 'bold' 
	},
	ownerButtonGroup: { 
		gap: 10, 
		marginBottom: 20 
	},
	buttonGroup: { 
		width: '100%' 
	},
	buttonPrimary: {
		backgroundColor: '#4CAF50',
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginBottom: 12,
	},
	buttonOutline: {
		borderColor: '#4CAF50',
		borderWidth: 1,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginBottom: 12,
	},
	buttonDanger: {
		backgroundColor: '#C62828',
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginBottom: 12,
	},
	buttonText: {
		fontWeight: '600',
		fontSize: 16,
		color: '#fff',
	},
	footer: {
  		position: 'absolute',
  		bottom: 0,
  		width: '100%',
  		height: 83,
	},
});
