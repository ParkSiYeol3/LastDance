import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, db } from '../firebase-config';
import CommentSection from './CommentSection';
import RentalHistory from './RentalHistory';
import EditItemForm from './EditItemForm';
import { getAuth } from 'firebase/auth';

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
        if (user?.uid) await fetchItemStatus(user.uid);
      }
    } catch (error) {
      console.error('유저 정보 로딩 오류:', error);
    }
  };

  const fetchItem = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/items/${itemId}`);
      setItem(res.data?.item ?? null);
      setItemOwnerName(res.data?.itemOwnerName ?? '');
      if (res.data?.item?.userId) {
        await fetchOwnerProfile(res.data.item.userId);
      }
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
      setLiked(res.data?.liked ?? false);
    } catch (error) {
      console.error('상태 불러오기 실패:', error);
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

    const updatedLikes = isLiked
      ? likedBy.filter((uid) => uid !== currentUser.uid)
      : [...likedBy, currentUser.uid];

    await updateDoc(itemRef, { likedBy: updatedLikes });

    setLiked(!isLiked);
  } catch (err) {
    console.error('좋아요 처리 실패:', err);
  }
};

  const handleRentalRequest = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    await axios.post(`${API_URL}/api/items/${itemId}/rentals`, {
      requesterId: currentUser.uid,
      ownerId: item.userId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
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
    const res = await axios.post(`${API_URL}/api/chat/start`, {
      userId1: user.uid,
      userId2: item.userId,
      rentalItemId: itemId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    navigation.navigate('ChatRoom', { roomId: res.data.chatRoomId });
  };

  const isOwner = currentUser?.uid === item?.userId;

  if (!item) {
    return <View style={styles.center}><Text>로딩 중...</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled={true}>
      <View style={styles.imageBox}>
        {item.imageURL && (
          <Image source={{ uri: item.imageURL }} style={styles.image} />
        )}
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={toggleLike}>
            <Text style={[styles.icon, liked && styles.liked]}>❤️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>

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
  );
};

export default ItemDetail;

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
  image: { 
    width: '100%', 
    height: 320, 
    borderRadius: 12, 
    resizeMode: 'cover' 
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
    alignItems: 'center' 
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
});