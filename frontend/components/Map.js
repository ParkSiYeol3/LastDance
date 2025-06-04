// ✅ 거리순/최신순 기준 자동완성 목록에 거리 또는 날짜 표시까지 반영된 MapScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Text, Image, TouchableOpacity, TextInput, FlatList, ScrollView } from 'react-native';
import Footer from '../components/Footer';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useNavigation } from '@react-navigation/native';

export default function MapScreen() {
	const [location, setLocation] = useState(null);
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedItem, setSelectedItem] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('전체');
	const [sortOption, setSortOption] = useState('거리순');
	const navigation = useNavigation();
	const mapRef = useRef(null);

	const categories = ['전체', '상의', '하의', '신발', '기타'];

	const getDistance = (lat1, lon1, lat2, lon2) => {
		const R = 6371;
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') return;
			const current = await Location.getCurrentPositionAsync({});
			setLocation(current.coords);
		})();
	}, []);

	useEffect(() => {
		if (location) loadItems();
	}, [location]);

	const loadItems = async () => {
		try {
			const snapshot = await getDocs(collection(db, 'items'));
			const fetched = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				if (data.latitude && data.longitude) {
					const distance = getDistance(location.latitude, location.longitude, data.latitude, data.longitude);
					fetched.push({ id: doc.id, ...data, distance });
				}
			});
			setItems(fetched);
		} catch (err) {
			console.error('아이템 불러오기 오류:', err);
		} finally {
			setLoading(false);
		}
	};

	const filteredItems = items
		.filter((item) => {
			const name = item.name?.toLowerCase().trim();
			const query = searchQuery.toLowerCase().trim();
			const categoryMatch = selectedCategory === '전체' || item.category === selectedCategory;
			return name && name.includes(query) && categoryMatch;
		})
		.sort((a, b) => {
			if (sortOption === '거리순') return a.distance - b.distance;
			if (sortOption === '최신순') return b.timestamp?.seconds - a.timestamp?.seconds;
			return 0;
		});

	const centerToCurrentLocation = () => {
		if (location && mapRef.current) {
			mapRef.current.animateToRegion({
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: 0.02,
				longitudeDelta: 0.02,
			});
		}
	};

	useEffect(() => {
		setSelectedItem(null);
	}, [searchQuery, selectedCategory, sortOption]);

	if (!location || loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color='#0000ff' />
				<Text>지도 불러오는 중...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.searchContainer}>
				<TextInput placeholder='상품 이름 검색' style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
			</View>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
				{categories.map((cat) => (
					<TouchableOpacity key={cat} style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonSelected]} onPress={() => setSelectedCategory(cat)}>
						<Text style={selectedCategory === cat ? styles.categoryTextSelected : styles.categoryText}>{cat}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			<View style={styles.sortContainer}>
				{['거리순', '최신순'].map((opt) => (
					<TouchableOpacity key={opt} style={[styles.sortButton, sortOption === opt && styles.sortButtonSelected]} onPress={() => setSortOption(opt)}>
						<Text style={sortOption === opt ? styles.sortTextSelected : styles.sortText}>{opt}</Text>
					</TouchableOpacity>
				))}
				<TouchableOpacity onPress={centerToCurrentLocation} style={styles.locationButton}>
					<Text style={styles.locationButtonText}>📍 내 위치</Text>
				</TouchableOpacity>
			</View>

			{searchQuery.length > 0 && (
				<View style={styles.searchResultBox}>
					{filteredItems.length > 0 ? (
						<FlatList
							data={filteredItems}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.searchResultItem}
									onPress={() => {
										navigation.navigate('ItemDetail', { itemId: item.id });
										setSearchQuery('');
										setSelectedItem(null);
									}}
								>
									<View>
										<Text style={styles.searchResultText}>{item.name}</Text>
										{sortOption === '거리순' && <Text style={styles.searchResultSubText}>📍 {item.distance.toFixed(1)}km</Text>}
										{sortOption === '최신순' && item.timestamp && (
											<Text style={styles.searchResultSubText}>🕒 {new Date(item.timestamp.seconds * 1000).toLocaleDateString('ko-KR')}</Text>
										)}
									</View>
								</TouchableOpacity>
							)}
						/>
					) : (
						<View style={styles.noResultContainer}>
							<Text style={styles.noResultText}>추천 결과가 없습니다.</Text>
						</View>
					)}
				</View>
			)}

			<MapView
				ref={mapRef}
				style={styles.map}
				initialRegion={{
					latitude: location.latitude,
					longitude: location.longitude,
					latitudeDelta: 0.02,
					longitudeDelta: 0.02,
				}}
			>
				<Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title='내 위치' pinColor='blue' />
				{filteredItems.map((item) => (
					<Marker key={item.id} coordinate={{ latitude: item.latitude, longitude: item.longitude }} onPress={() => setSelectedItem(item)}>
						<Image source={require('../assets/marker.png')} style={{ width: 45, height: 45 }} resizeMode='contain' />
					</Marker>
				))}
			</MapView>

			{selectedItem && (
				<View style={styles.bottomCard}>
					<Image source={{ uri: selectedItem.imageURL }} style={styles.cardImage} />
					<View style={styles.cardTextBox}>
						<Text style={styles.cardTitle}>{selectedItem.name}</Text>
						<Text style={styles.cardDistance}>{selectedItem.distance.toFixed(1)}km 근처</Text>
						<Text style={styles.cardPrice}>대여비: {selectedItem.price || '가격 정보 없음'}원</Text>
						<TouchableOpacity
							style={styles.detailButton}
							onPress={() => {
								navigation.navigate('ItemDetail', { itemId: selectedItem.id });
								setSelectedItem(null);
							}}
						>
							<Text style={{ color: '#fff', fontWeight: 'bold' }}>상세 보기</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

			<View style={styles.footer}>
				<Footer navigation={navigation} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
	loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	searchContainer: {
		position: 'absolute',
		top: 50,
		left: 20,
		right: 20,
		zIndex: 5,
		backgroundColor: '#fff',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		elevation: 4,
	},
	searchInput: { fontSize: 16 },
	categoryContainer: {
		position: 'absolute',
		top: 100,
		left: 0,
		right: 0,
		paddingHorizontal: 10,
		paddingVertical: 6,
		zIndex: 5,
	},
	categoryButton: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 16,
		backgroundColor: '#f0f0f0',
		marginRight: 8,
	},
	categoryButtonSelected: { backgroundColor: '#31c585' },
	categoryText: { fontSize: 14, color: '#333' },
	categoryTextSelected: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
	sortContainer: {
		position: 'absolute',
		top: 150,
		left: 10,
		right: 10,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		zIndex: 5,
	},
	sortButton: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		backgroundColor: '#eee',
		borderRadius: 8,
	},
	sortButtonSelected: { backgroundColor: '#31c585' },
	sortText: { fontSize: 13, color: '#333' },
	sortTextSelected: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
	locationButton: {
		marginLeft: 'auto',
		backgroundColor: '#31c585',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
	},
	locationButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
	searchResultBox: {
		position: 'absolute',
		top: 200,
		left: 20,
		right: 20,
		maxHeight: 200,
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 6,
		zIndex: 4,
		elevation: 5,
	},
	searchResultItem: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	searchResultText: { fontSize: 15, color: '#333' },
	searchResultSubText: { fontSize: 12, color: '#888', marginTop: 2 },
	noResultContainer: { padding: 10, alignItems: 'center' },
	noResultText: { fontSize: 14, color: '#888' },
	bottomCard: {
		position: 'absolute',
		bottom: 90,
		left: 20,
		right: 20,
		flexDirection: 'row',
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		elevation: 6,
		alignItems: 'center',
		zIndex: 1,
	},
	cardImage: { width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' },
	cardTextBox: { flex: 1, justifyContent: 'center' },
	cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
	cardDistance: { fontSize: 13, color: '#666', marginTop: 4 },
	cardPrice: { fontSize: 13, color: '#333', marginTop: 2 },
	detailButton: {
		marginTop: 8,
		backgroundColor: '#31c585',
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 6,
		alignSelf: 'flex-start',
	},
	footer: { position: 'absolute', bottom: 0, height: 85, width: '100%' },
});
