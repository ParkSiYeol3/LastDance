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

        // 1. 사용자의 favorites 목록 가져오기
        const favRef = collection(db, 'favorites');
        const favQuery = query(favRef, where('userId', '==', user.uid));
        const favSnapshot = await getDocs(favQuery);

        const itemPromises = favSnapshot.docs.map(async (docSnap) => {
          const itemId = docSnap.data().itemId;
          const itemRef = doc(db, 'items', itemId);
          const itemSnap = await getDoc(itemRef);
          return { id: itemId, ...itemSnap.data() };
        });

        const items = await Promise.all(itemPromises);
        setFavoriteItems(items.filter(Boolean)); // null 필터링
      } catch (err) {
        console.error('좋아요 목록 불러오기 실패:', err);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원님이 주목하고 있는 상품</Text>

      <ScrollView style={styles.scrollView}>
        {favoriteItems.length === 0 ? (
          <Text style={styles.emptyText}>좋아요한 게시글이 없습니다.</Text>
        ) : (
          favoriteItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemContainer}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            >
              <Image
                style={styles.itemImage}
                source={
                  item.imageURL
                    ? { uri: item.imageURL }
                    : require('../assets/top.png') // 기본 이미지
                }
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price ? `${item.price}원` : '가격 미정'}</Text>
              </View>
              <Text style={styles.heartIcon}>❤️</Text>
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
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollView: {
    marginBottom: 60,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  heartIcon: {
    fontSize: 20,
    color: '#FF4500',
    marginLeft: 8,
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
		width: '109%',
  },
});