// components/ChatList.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Footer from '../components/Footer';
import { Dimensions } from 'react-native';
import ChatListItem from './ChatListItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../firebase-config';
import { doc, getDocs, collection, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const { height } = Dimensions.get('window');

const ChatList = () => {
	const [chatRooms, setChatRooms] = useState([]);
	const [averageRatings, setAverageRatings] = useState({});
	const navigation = useNavigation();

	useEffect(() => {
		const fetchChatRooms = async () => {
			try {
				const token = await AsyncStorage.getItem('accessToken');
				if (!token) {
					Alert.alert('오류', '로그인이 필요합니다.');
					return;
				}

				const res = await axios.get(`${API_URL}/api/chat/rooms/with-profile`, { headers: { Authorization: `Bearer ${token}` } });
				const rooms = res.data.rooms || [];
				setChatRooms(rooms);

				// 평균 별점 조회
				const promises = rooms.map((room) => axios.get(`${API_URL}/api/reviews/average/${room.opponent.uid}`));
				const results = await Promise.allSettled(promises);
				const ratings = {};
				results.forEach((res, i) => {
					if (res.status === 'fulfilled') {
						ratings[rooms[i].opponent.uid] = res.value.data;
					}
				});
				setAverageRatings(ratings);
			} catch (err) {
				console.error('채팅방 목록 조회 실패:', err);
				Alert.alert('오류', '채팅방 목록을 불러오지 못했습니다.');
			}
		};

		fetchChatRooms();
	}, []);

	const handleRoomLongPress = (room) => {
		Alert.alert(
			'채팅방 옵션',
			`채팅방 "${room.opponent.nickname}"에 대해 수행할 작업을 선택하세요.`,
			[
				{
					text: '🔕 알림 끄기',
					onPress: () => handleMuteChatRoom(room.id),
				},
				{
					text: '🗑 삭제하기',
					style: 'destructive',
					onPress: () => handleDeleteChatRoom(room.id),
				},
				{ text: '취소', style: 'cancel' },
			],
			{ cancelable: true }
		);
	};

	const handleDeleteChatRoom = async (roomId) => {
		try {
			const messagesSnap = await getDocs(collection(db, 'chatRooms', roomId, 'messages'));
			const batch = writeBatch(db);
			messagesSnap.forEach((docSnap) => {
				batch.delete(docSnap.ref);
			});
			batch.delete(doc(db, 'chatRooms', roomId));
			await batch.commit();
			Alert.alert('삭제 완료', '채팅방이 삭제되었습니다.');
			setChatRooms((prev) => prev.filter((room) => room.id !== roomId));
		} catch (err) {
			console.error('채팅방 삭제 오류:', err);
			Alert.alert('오류', '채팅방 삭제에 실패했습니다.');
		}
	};

	const handleMuteChatRoom = async (roomId) => {
		try {
			await updateDoc(doc(db, 'chatRooms', roomId), { muted: true });
			Alert.alert('알림 꺼짐', '이 채팅방의 알림이 꺼졌습니다.');
		} catch (err) {
			console.error('알림 끄기 실패:', err);
			Alert.alert('오류', '알림 설정 변경 실패');
		}
	};

	const renderItem = ({ item }) => {
		const time = item.createdAt ? new Date(item.createdAt._seconds ? item.createdAt._seconds * 1000 : item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

		const rating = averageRatings[item.opponent.uid];

		return (
			<TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { roomId: item.id })} onLongPress={() => handleRoomLongPress(item)}>
				<ChatListItem
					name={item.opponent?.nickname || '알 수 없는 사용자'}
					time={time}
					message={item.lastMessage || ''}
					imageUrl={''}
					profileImageUrl={item.opponent?.profileImage || ''}
					unreadCount={item.unreadCount ?? 0}
				/>
				{rating && (
					<Text style={styles.ratingText}>
						⭐ {rating.average}점 ({rating.count}명)
					</Text>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.wrapper}>
			<View style={styles.container}>
				<Text style={styles.title}>채팅 목록</Text>
				<FlatList data={chatRooms} keyExtractor={(item) => item.id} renderItem={renderItem} ListEmptyComponent={<Text>채팅방이 없습니다.</Text>} />
			</View>

			<View style={styles.footer}>
				<Footer navigation={navigation} />
			</View>
		</View>
	);
};

export default ChatList;

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%',
	height: 83,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  ratingText: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 12, 
    marginBottom: 8 
  },
});
