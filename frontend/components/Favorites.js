// Favorites.js (카드형 UI로 리디자인된 좋아요 페이지)

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase-config';
import Footer from './Footer';

const Favorites = ({ navigation }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userJson = await AsyncStorage.getItem('currentUser');
        if (!userJson) return;
        const user = JSON.parse(userJson);

        const favRef = collection(db, 'favorites');
        const favQuery = query(favRef, where('userId', '==', user.uid));
        const favSnapshot = await getDocs(favQuery);

        const itemPromises = favSnapshot.docs.map(async (docSnap) => {
          const itemId = docSnap.data().itemId;
          const createdAt = docSnap.data().createdAt?.toDate();

          const itemRef = doc(db, 'items', itemId);
          const itemSnap = await getDoc(itemRef);
          return { id: itemId, ...itemSnap.data(), createdAt };
        });

        const items = await Promise.all(itemPromises);
        setFavoriteItems(items.filter(Boolean));
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
              <Image
                style={styles.image}
                source={
                  item.imageURL
                    ? { uri: item.imageURL }
                    : require('../assets/top.png')
                }
              />
              <View style={styles.cardContent}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.deposit}>{item.deposit ? `보증금 ${Number(item.deposit).toLocaleString()}원` : '보증금 미정'}</Text>
                {item.createdAt && (
                  <Text style={styles.time}>
                    ❤️ {new Date(item.createdAt).toLocaleString('ko-KR', {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
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
    flexDirection: 'row',
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
  time: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    height: 86,
    width: '100%',
  },
});
