import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../firebase-config';
import CommentSection from './CommentSection';
import RentalHistory from './RentalHistory';
import EditItemForm from './EditItemForm';
import { getAuth } from 'firebase/auth';
import * as Location from 'expo-location';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';

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
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    loadUserAndItem();
  }, []);

  const loadUserAndItem = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        await fetchItem();
        await fetchItemStatus(user.uid);
      }
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

  const fetchItemStatus = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/api/items/${itemId}/status`, {
        params: { userId },
      });
      setLiked(res.data.liked);
      setBookmarked(res.data.bookmarked);
    } catch (error) {
      console.error('상태 불러오기 실패:', error);
    }
  };

  const toggleLike = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const url = `${API_URL}/api/items/${itemId}/like`;
      if (liked) {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId: currentUser.uid },
        });
      } else {
        await axios.post(url, { userId: currentUser.uid }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setLiked(!liked);
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    }
  };

  const toggleBookmark = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const url = `${API_URL}/api/items/${itemId}/bookmark`;
      if (bookmarked) {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId: currentUser.uid },
        });
      } else {
        await axios.post(url, { userId: currentUser.uid }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('찜 처리 실패:', err);
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

      const { chatRoomId } = res.data;
      navigation.navigate('ChatRoom', { roomId: chatRoomId });
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
      <View style={styles.imageBox}>
        {item.imageURL && (
          <Image source={{ uri: item.imageURL }} style={styles.image} />
        )}

        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={toggleLike}>
            <Text style={[styles.icon, liked && styles.liked]}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleBookmark}>
            <Text style={[styles.icon, bookmarked && styles.bookmarked]}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.ownerText}>판매자: {itemOwnerName}</Text>
      </View>

      {isOwner && (
        <View style={styles.ownerNoticeBox}>
          <Text style={styles.ownerNoticeText}>본인의 물품입니다.</Text>
        </View>
      )}

      {!isOwner && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRentalRequest}
            disabled={rentalRequested}
          >
            <Text style={styles.buttonText}>
              {rentalRequested ? '요청됨!' : '대여 요청하기'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={handleStartChat}
            disabled={loadingChat}
          >
            <Text style={styles.buttonOutlineText}>
              {loadingChat ? '채팅 연결 중...' : '채팅하기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isOwner && !editing && (
        <View style={styles.ownerButtonGroup}>
          <TouchableOpacity style={styles.buttonEdit} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>상품 수정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonDelete} onPress={handleDelete}>
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
  );
};

export default ItemDetail;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    gap: 20,
  },
  imageBox: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 24,
    opacity: 0.4,
  },
  liked: {
    opacity: 1,
    color: '#FF2D55',
  },
  bookmarked: {
    opacity: 1,
    color: '#007AFF',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  ownerText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
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
    fontSize: 14,
  },
  ownerButtonGroup: {
    gap: 10,
    marginBottom: 20,
  },
  buttonGroup: {
    width: '100%',
  },
  button: {
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonOutline: {
    borderColor: '#222',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonOutlineText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonEdit: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDelete: {
    backgroundColor: '#FF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
