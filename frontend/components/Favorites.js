import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { collection, query, where, get, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase-config';
import Footer from './Footer';
import BlackHeart from '../assets/blackHeart.png';
import { API_URL } from '../firebase-config';
import axios from 'axios';

const Favorites = ({ navigation }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);

  useEffect(() => {
  const fetchFavorites = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) return;
      const user = JSON.parse(userJson);

      // 1. 사용자의 favorites 목록 가져오기
      const favRef = collection(db, 'favorites');
      const favQuery = query(favRef, where('userId', '==', user.uid));
      const favSnapshot = await getDocs(favQuery);

      // 2. 각 favorite item의 상세 정보 가져오기 (예외처리 포함)
      const itemPromises = favSnapshot.docs.map(async (docSnap) => {
        const itemId = docSnap.data().itemId;
        const createdAt = docSnap.data().createdAt?.toDate();
        try {
          const res = await axios.get(`${API_URL}/api/items/${itemId}`);
          const item = res.data.item;
          return { id: itemId, ...item, createdAt };
        } catch (error) {
          console.warn(`❌ 아이템 ${itemId} 불러오기 실패:`, error.response?.status, error.response?.data);

          try {
            await deleteDoc(doc(db, 'favorites', docSnap.id));
            console.log(`✅ 삭제된 아이템 ${itemId}의 favorite 문서 제거됨`);
          } catch (deleteErr) {
            console.error(`❌ favorite 문서 삭제 실패: ${docSnap.id}`, deleteErr);
          }

          return null;
        }
      });

      const items = await Promise.all(itemPromises);
      const filtered = items.filter(Boolean);
      if (filtered.length !== items.length) {
        console.warn('🗑 일부 삭제된 아이템이 제거되었습니다.');
      }
setFavoriteItems(filtered);
    } catch (err) {
      console.error('좋아요 목록 불러오기 실패:', err);
    }
  };

  fetchFavorites();
}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원님이 주목하고 있는 상품</Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.cardList}>
        {favoriteItems.length === 0 ? (
          <Text style={styles.emptyText}>좋아요한 게시글이 없습니다.</Text>
        ) : (
          favoriteItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            >
              <Image style={styles.image} source={{ uri: Array.isArray(item.imageURLs) && item.imageURLs.length > 0
              ? item.imageURLs[0]
              : typeof item.imageURL === 'string'
                ? item.imageURL
                : 'https://via.placeholder.com/100'
              }}/>
              
              <View style={styles.cardContent}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.deposit}>{item.deposit ? `보증금 ${Number(item.deposit).toLocaleString()}원` : '보증금 미정'}</Text>
                {item.createdAt && (
                  <View style={styles.likeRow}>
                    <Image source={BlackHeart} style={styles.heartIcon} />
                    <Text style={styles.time}>
                      {new Date(item.createdAt).toLocaleString('ko-KR', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  cardList: {
    paddingBottom: 80,
    gap: 16,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  deposit: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  heartIcon: {
    width: 14,
    height: 14,
    tintColor: '#000',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
  footer: {
    position: 'absolute',
		bottom: 0,
		height:86,
		width: '100%',
  },
});