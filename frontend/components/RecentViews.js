import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { db } from '../firebase-config';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../components/Footer';

const RecentViews = ({ navigation }) => {
	const [recentItems, setRecentItems] = useState([]);

	useEffect(() => {
		const fetchRecentItems = async () => {
			try {
				const userJson = await AsyncStorage.getItem('currentUser');
				if (!userJson) return;
				const user = JSON.parse(userJson);

				const recentRef = collection(db, 'recentViews');
				const q = query(recentRef, where('userId', '==', user.uid), orderBy('viewedAt', 'desc'));

				const snapshot = await getDocs(q);

				const items = await Promise.all(
					snapshot.docs.map(async (docSnap) => {
						const itemId = docSnap.data().itemId;
						const itemRef = doc(db, 'items', itemId);
						const itemSnap = await getDoc(itemRef);
						if (!itemSnap.exists()) return null;

						const itemData = itemSnap.data();

						// ❤️ 좋아요 수
						const likes = Array.isArray(itemData.likedBy) ? itemData.likedBy.length : 0;

						// ⭐️ 평균 별점 계산
						const reviewQuery = query(collection(db, 'reviews'), where('itemId', '==', itemId));
						const reviewSnap = await getDocs(reviewQuery);
						const ratings = reviewSnap.docs.map((doc) => doc.data().rating || 0);
						const averageRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0.0';

						return {
							id: itemId,
							...itemData,
							likes,
							averageRating,
						};
					})
				);

				setRecentItems(items.filter(Boolean));
			} catch (error) {
				console.error('최근 본 상품 불러오기 실패:', error);
			}
		};

		fetchRecentItems();
	}, []);

	const renderItem = ({ item }) => (
		<TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}>
			<Image source={{ uri: item.imageURL || 'https://via.placeholder.com/100' }} style={styles.image} />
			<Text style={styles.title} numberOfLines={1}>
				{item.name}
			</Text>
			{/* ❤️ 좋아요 + ⭐ 평균 별점 UI 추가 */}
			<Text style={styles.meta}>
				❤️ {item.likes} ⭐ {item.averageRating}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.header}>최근 본 상품</Text>
			<FlatList
				data={recentItems}
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

export default RecentViews;

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
		marginBottom: 16,
		textAlign: 'center',
	},
	card: {
		width: '48%',
		backgroundColor: '#fafafa',
		borderRadius: 10,
		padding: 10,
		marginBottom: 16,
		alignItems: 'center',
		elevation: 2,
		fontWeight: 'bold',
	},
	meta: {
		fontSize: 12,
		color: '#666',
		marginTop: 4,
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 8,
		marginBottom: 8,
	},
	title: {
		fontSize: 14,
		textAlign: 'center',
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		height: 86,
		width: '109%',
	},
});
