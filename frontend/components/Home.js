import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, query, orderBy, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Footer from './Footer';
import blackHeart from '../assets/blackHeart.png'; // 찜한 상태
import BIN_blackHeart from '../assets/BIN_blackHeart.png'; // 찜 안 한 상태

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

	const fetchAverageRating = async (itemId) => {
		try {
      		const reviewsRef = collection(db, 'reviews');
      		const q = query(reviewsRef, where('rentalItemId', '==', itemId));
      		const snapshot = await getDocs(q);

			 const ratings = snapshot.docs.map((doc) => doc.data().rating).filter(Boolean);
      		 const average = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

			return { average: Number(average.toFixed(1)), count: ratings.length };
		} catch (err) {
			console.error(`평점 불러오기 실패 (${itemId}):`, err);
			return { average: 0, count: 0 };
    	}
  	};

	 useEffect(() => {
		const auth = getAuth();
    	setCurrentUser(auth.currentUser);

		const q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));

		 const unsubscribe = onSnapshot(q, async (querySnapshot) => {
			const fetchedPosts = await Promise.all(
				querySnapshot.docs.map(async (doc) => {
					const item = { id: doc.id, ...doc.data() };
          			const { average, count } = await fetchAverageRating(item.id);
          			return { ...item, rating: average, ratingCount: count };
        		})
      		);
      		setPosts(fetchedPosts);
    	});

		return () => unsubscribe();
  	}, []);

	const toggleLikeFromHome = async (itemId, likedBy = [], isLiked) => {
    	if (!currentUser) return;
    	const itemRef = doc(db, 'items', itemId);
    	const updatedLikes = isLiked ? likedBy.filter((uid) => uid !== currentUser.uid) : [...likedBy, currentUser.uid];
    	await updateDoc(itemRef, { likedBy: updatedLikes });

	const favoriteRef = doc(db, 'favorites', `${currentUser.uid}_${itemId}`);
	if (isLiked) {
      await deleteDoc(favoriteRef);
    } else {
      const itemSnap = await getDoc(itemRef);
      const itemData = itemSnap.exists() ? itemSnap.data() : {};
      await setDoc(favoriteRef, {
        userId: currentUser.uid,
        itemId: itemId,
        createdAt: serverTimestamp(),
        itemName: itemData.name || '',
        imageURL: itemData.imageURLs?.[0] || itemData.imageURL || '',
        deposit: itemData.deposit || '',
      });
    }
  };

	 const filteredPosts = posts.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()) && (!selectedCategory || p.category === selectedCategory));
	 
	 const renderItem = ({ item }) => {
		const isMine = currentUser && item.userId === currentUser.uid;
    	const isLiked = (item.likedBy || []).includes(currentUser?.uid);

	return (
      <TouchableOpacity
        style={[styles.card, isMine && styles.myPostBorder]}
        onPress={() => {
          if (!item.id) {
            Alert.alert('오류', '아이템 ID가 없습니다.');
            return;
          }
          navigation.navigate('ItemDetail', { itemId: item.id });
        }}
        activeOpacity={0.9}
      >
        {(item.imageURLs?.length > 0 || item.imageURL) && <Image source={{ uri: item.imageURLs?.[0] || item.imageURL }} style={styles.image} />}
        <View style={styles.infoBox}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.metaRow}>
            <TouchableOpacity onPress={() => toggleLikeFromHome(item.id, item.likedBy || [], isLiked)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Image source={isLiked ? blackHeart : BIN_blackHeart} style={styles.heartIcon} />
            </TouchableOpacity>
            <Text style={styles.metaText}>{item.likedBy?.length || 0}</Text>
            <Image source={require('../assets/star.png')} style={styles.starIcon} />
            <Text style={styles.metaText}>{item.rating?.toFixed(1) || '0.0'} ({item.ratingCount || 0})</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

	return (
		<View style={styles.screen}>
			<View style={styles.header}>
        		<Image source={require('../assets/Logo.png')} style={styles.logo} />
        		<Text style={styles.appName}>이거옷대여?</Text>
      		</View>

			<View style={styles.searchContainer}>
				<TextInput style={styles.input} placeholder='검색어를 입력하세요!' value={search} onChangeText={setSearch} />
				<TouchableOpacity style={styles.searchButton}>
					<Image source={require('../assets/search.png')} style={styles.searchIcon} />
				</TouchableOpacity>
			</View>

			<View style={styles.categoriesContainer}>
				{[
					{ label: '상의', image: require('../assets/top.png') },
          			{ label: '하의', image: require('../assets/bottom.png') },
          			{ label: '신발', image: require('../assets/shoes.png') },
          			{ label: '가방', image: require('../assets/bag.png') },
        		].map((item, index) => (
          			<TouchableOpacity
            			key={index}
            			style={[styles.categoryCard, selectedCategory === item.label && { backgroundColor: '#31c585' }]}
            			onPress={() => setSelectedCategory((prev) => (prev === item.label ? null : item.label))}
          			>
            			<Image source={item.image} style={styles.categoryIcon} />
            			<Text style={[styles.categoryText, selectedCategory === item.label && { color: 'white', fontWeight: 'bold' }]}>{item.label}</Text>
          			</TouchableOpacity>
       			))}
      		</View>

			 <FlatList
        		data={filteredPosts}
        		renderItem={renderItem}
        		keyExtractor={(item) => item.id}
        		numColumns={2}
        		columnWrapperStyle={{ justifyContent: 'space-between' }}
        		contentContainerStyle={{ paddingBottom: 100 }}
      		/>

			<TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate('Write')}>
       		 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          		<Image source={require('../assets/Write.png')} style={styles.writeIcon} />
          		<Text style={styles.writeText}>글쓰기</Text>
        		</View>
      		</TouchableOpacity>

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
	header: {
    	flexDirection: 'row',
    	alignItems: 'center',
    	backgroundColor: '#fff',
    	borderBottomColor: '#eee',
  	},
  	logo: {
    	width: 70,
    	height: 70,
    	resizeMode: 'contain',
  	},
  	appName: {
    	fontSize: 18,
    	fontWeight: 'bold',
		color: '#31c585',
    	marginLeft: 5,
		marginBottom: 5,
  	},
	searchContainer: {
		flexDirection: 'row',
		marginBottom: 16,
	},
	input: {
		flex: 1,
		height: 40,
		borderWidth: 1,
		borderColor: '#31c585',
		borderRadius: 8,
		paddingHorizontal: 12,
		backgroundColor: '#fff',
	},
	searchButton: {
		marginLeft: 8,
		backgroundColor: '#31c585',
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
		borderColor: '#31c585',
	},
	image: {
		width: '100%',
		aspectRatio: 1,
		resizeMode: 'cover',
	},
	infoBox: {
		padding: 10,
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
	metaText: {
		fontSize: 13,
		color: '#444',
		marginLeft: 4,
	},
	heartIcon: {
		width: 16,
		height: 16,
		tintColor: '#000', 
	},
	starIcon: {
		width: 14,
		height: 14,
		tintColor: '#FFD700',
		marginLeft: 8,
	},
	writeButton: {
		position: 'absolute',
		bottom: 100,
		right: 20,
		backgroundColor: '#31c585',
		borderRadius: 30,
		paddingVertical: 10,
		paddingHorizontal: 16,
		elevation: 4,
		flexDirection: 'row',
		alignItems: 'center',
	},
	writeIcon: {
		width: 16,
		height: 16,
		marginRight: 6,
		tintColor: '#fff',
	},
	writeText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		height: 83,
		width: '109%',
	},
});
