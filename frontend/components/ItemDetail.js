// ✅ 판매자 프로필 fetch를 userRoutes 기반으로 연결 (404 방지 및 TypeError 예방)
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
  const [itemOwnerProfile, setItemOwnerProfile] = useState(null);
  const [rentalRequested, setRentalRequested] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    loadUserAndItem();
  }, []);

  const toggleLike = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const url = `${API_URL}/api/items/${itemId}/like`;
      if (liked) {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId: currentUser?.uid },
        });
      } else {
        await axios.post(url, { userId: currentUser?.uid }, {
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
          data: { userId: currentUser?.uid },
        });
      } else {
        await axios.post(url, { userId: currentUser?.uid }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('찜 처리 실패:', err);
    }
  };

  const fetchItemStatus = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/api/items/${itemId}/status`, {
        params: { userId },
      });
      setLiked(res.data?.liked ?? false);
      setBookmarked(res.data?.bookmarked ?? false);
    } catch (error) {
      console.error('상태 불러오기 실패:', error);
    }
  };

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

  const fetchOwnerProfile = async (ownerId) => {
    if (!ownerId) return;
    try {
      const res = await axios.get(`${API_URL}/api/users/${ownerId}`);
      setItemOwnerProfile(res.data);
    } catch (err) {
      console.error('판매자 프로필 불러오기 실패:', err);
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
        {item?.imageURL && (
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
        <Text style={styles.title}>{item?.name}</Text>
        <Text style={styles.description}>{item?.description}</Text>

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
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
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
  profileBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  profileNickname: { fontSize: 16, color: '#007AFF', textDecorationLine: 'underline' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});