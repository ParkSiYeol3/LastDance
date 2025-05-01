import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config'; // Firebase Firestore 연결
import Footer from './Footer';

const Home = ({ navigation }) => {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		fetchPosts();
	}, []);

	
	const fetchPosts = async () => {
		try {
			const q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));
			const querySnapshot = await getDocs(q);
			const fetchedPosts = [];

			querySnapshot.forEach((doc) => {
				fetchedPosts.push({ id: doc.id, ...doc.data() });
			});

			setPosts(fetchedPosts);
		} catch (error) {
			console.error('게시글 불러오기 오류:', error);
		}
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity style={styles.postCard} onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}>
			{item.imageURL && <Image source={{ uri: item.imageURL }} style={styles.image} />}
			<Text style={styles.title}>{item.name}</Text>
			<Text style={styles.description}>{item.description}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.screen}>
			{/* 검색창 */}
			<View style={styles.searchContainer}>
				<TextInput style={styles.input} placeholder='검색어를 입력하세요' />
				<TouchableOpacity style={styles.searchButton}>
					<Image source={require('../assets/search.png')} style={styles.searchIcon} />
				</TouchableOpacity>
			</View>

			{/* 카테고리 */}
			<Text style={styles.sectionTitle}>카테고리</Text>
			<View style={styles.categoriesContainer}>
				<TouchableOpacity style={styles.categoryCard}>
					<Image source={require('../assets/top.png')} style={styles.categoryIcon} />
					<Text style={styles.categoryText}>상의</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.categoryCard}>
					<Image source={require('../assets/bottom.png')} style={styles.categoryIcon} />
					<Text style={styles.categoryText}>하의</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.categoryCard}>
					<Image source={require('../assets/shoes.png')} style={styles.categoryIcon} />
					<Text style={styles.categoryText}>신발</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.categoryCard}>
					<Image source={require('../assets/bag.png')} style={styles.categoryIcon} />
					<Text style={styles.categoryText}>가방</Text>
				</TouchableOpacity>
			</View>

			{/* 게시글 목록 */}
			<FlatList data={posts} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 100 }} />

			{/* 글쓰기 버튼 */}
			<TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate('Write')}>
				<Text style={styles.writeText}>글쓰기</Text>
			</TouchableOpacity>

			{/* 하단 버튼 */}
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
		backgroundColor: '#f2f2f2',
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
		borderColor: '#1976d2',
		borderRadius: 8,
		paddingHorizontal: 12,
		backgroundColor: '#fff',
	},
	searchButton: {
		marginLeft: 8,
		backgroundColor: '#3371EF',
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
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	categoriesContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	categoryCard: {
		width: 70,
		height: 100,
		backgroundColor: '#fff',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10,
		elevation: 3,
	},
	categoryIcon: {
		width: 40,
		height: 40,
		resizeMode: 'contain',
	},
	categoryText: {
		fontSize: 14,
		marginTop: 4,
	},
	postCard: {
		backgroundColor: '#fff',
		marginBottom: 16,
		padding: 12,
		borderRadius: 10,
		elevation: 3,
	},
	image: {
		width: '100%',
		height: 150,
		resizeMode: 'cover',
		borderRadius: 8,
		marginBottom: 8,
	},
	title: {
		fontWeight: 'bold',
		fontSize: 18,
		marginBottom: 4,
	},
	description: {
		fontSize: 14,
		color: '#555',
	},
	writeButton: {
		position: 'absolute',
		bottom: 80,
		right: 20,
		backgroundColor: '#3371EF',
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 18,
	},
	writeText: {
		color: '#fff',
		fontWeight: 'bold',
	},
});
