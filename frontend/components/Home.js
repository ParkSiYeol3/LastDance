import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity
} from 'react-native';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Footer from './Footer';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    setCurrentUser(auth.currentUser);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedPosts = [];
    querySnapshot.forEach((doc) => {
      fetchedPosts.push({ id: doc.id, ...doc.data() });
    });
    setPosts(fetchedPosts);
  };

  const handleLike = async (itemId, likedBy, isLiked) => {
    const itemRef = doc(db, 'items', itemId);
    const updatedLikes = isLiked
      ? likedBy.filter((uid) => uid !== currentUser.uid)
      : [...likedBy, currentUser.uid];
    await updateDoc(itemRef, { likedBy: updatedLikes });
    fetchPosts();
  };

  const filteredPosts = posts.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const isMine = currentUser && item.userId === currentUser.uid;
    const isLiked = item.likedBy?.includes(currentUser?.uid);

    return (
      <TouchableOpacity
        style={[styles.card, isMine && styles.myPostBorder]}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
        activeOpacity={0.9}
      >
        {item.imageURL && <Image source={{ uri: item.imageURL }} style={styles.image} />}
        <View style={styles.infoBox}>
          <Text style={styles.brand}>{item.brand || '브랜드명'}</Text>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

          <View style={styles.metaRow}>
            <TouchableOpacity
              onPress={() => handleLike(item.id, item.likedBy || [], isLiked)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image
                source={
                  isLiked
                    ? require('../assets/heart.png')
                    : require('../assets/BIN_heart.png')
                }
                style={styles.heartIcon}
              />
            </TouchableOpacity>
            <Text style={styles.metaText}>
              {item.likedBy?.length || 0}
            </Text>

            <Image
              source={require('../assets/star.png')}
              style={styles.starIcon}
            />
            <Text style={styles.metaText}>
              {item.rating?.toFixed(1) || '0.0'} ({item.ratingCount || 0})
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="검색어를 입력하세요"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Image source={require('../assets/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>P2P clothes rental platform | 이거옷대여?</Text>
      <View style={styles.categoriesContainer}>
        {[
          { label: '상의', image: require('../assets/top.png') },
          { label: '하의', image: require('../assets/bottom.png') },
          { label: '신발', image: require('../assets/shoes.png') },
          { label: '가방', image: require('../assets/bag.png') },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.categoryCard}>
            <Image source={item.image} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 게시글 목록 */}
      <FlatList
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    backgroundColor: '#4CAF50'
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: 70,
    height: 70,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  categoryIcon: {
  width: 40,
  height: 40,
  resizeMode: 'contain',
  marginBottom: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  myPostBorder: {
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  infoBox: {
    padding: 10,
  },
  brand: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    color: '#111',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heartIcon: {
    width: 16,
    height: 16,
    tintColor: '#FF5A5F',
  },
  starIcon: {
    width: 14,
    height: 14,
    tintColor: '#FFD700',
    marginLeft: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#444',
  },
  footer: {
    position: 'absolute',
		bottom: 0,
		width: '108%',
  },
});