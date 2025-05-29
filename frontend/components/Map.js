import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Text, Image, TouchableOpacity } from 'react-native';
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
	const navigation = useNavigation();

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
			if (status !== 'granted') {
				console.log('위치 권한 거부됨');
				return;
			}

			const current = await Location.getCurrentPositionAsync({});
			setLocation(current.coords);
		})();
	}, []);

	useEffect(() => {
		if (location) {
			loadItems();
		}
	}, [location]);

	const loadItems = async () => {
		try {
			const snapshot = await getDocs(collection(db, 'items'));
			const fetchedItems = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				if (data.latitude && data.longitude) {
					const distance = getDistance(location.latitude, location.longitude, data.latitude, data.longitude);
					fetchedItems.push({ id: doc.id, ...data, distance });
				}
			});
			setItems(fetchedItems);
		} catch (err) {
			console.error('아이템 불러오기 오류:', err);
		} finally {
			setLoading(false);
		}
	};

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
    	<MapView
      	style={styles.map}
      	initialRegion={{
        	latitude: location.latitude,
        	longitude: location.longitude,
        	latitudeDelta: 0.02,
        	longitudeDelta: 0.02,
      	}}
    	>
      	{/* 내 위치 마커 */}
      	<Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title='내 위치' pinColor='blue' />

      	{/* 아이템 카드 마커 */}
      	{items.map((item) => (
			<Marker
  			key={item.id}
  			coordinate={{ latitude: item.latitude, longitude: item.longitude }}
  			onPress={() => setSelectedItem(item)}
			>
  			<Image
    			source={require('../assets/marker.png')}
    			style={{ width: 45, height: 45 }} // ✅ 여기서 직접 조절
    			resizeMode="contain"
  			/>
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
  	</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	// 🔹 마커 안에 표시될 커스텀 카드 전체 박스
	customMarker: {
		width: 150, // 정사각형을 기준으로 전체 크기 확장
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 2,
		alignItems: 'center',
		elevation: 5, // Android 그림자
		shadowColor: '#000', // iOS 그림자
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 5,
		// ✅ 왼쪽으로 절반 만큼 밀어서 마커 중앙 정렬
		transform: [{ translateX: -40 }],
	},

	// 🔹 상품 이미지 (정사각형 비율, 더 크게)
	markerImage: {
		width: 40, // 전체보다 조금 작게
		height: 40, // 정사각형
		borderRadius: 10,
		marginBottom: 2,
	},

	// 🔹 상품 이름 텍스트
	markerTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 4,
	},

	// 🔹 거리 텍스트
	markerDistance: {
		fontSize: 14,
		color: '#555',
	},
	bottomCard: {
  		position: 'absolute',
  		bottom: 30,
  		left: 20,
  		right: 20,
  		flexDirection: 'row',
  		backgroundColor: '#ffffff',
  		borderRadius: 16,
  		padding: 16,
  		elevation: 6,
  		shadowColor: '#000',
  		shadowOpacity: 0.15,
  		shadowOffset: { width: 0, height: 3 },
  		shadowRadius: 6,
  		alignItems: 'center',
	},
	cardImage: {
		width: 64,
		height: 64,
		borderRadius: 8,
		marginRight: 12,
		backgroundColor: '#f0f0f0',
	},
	cardTextBox: {
		flex: 1,
		justifyContent: 'center',
	},
	cardTitle: {
		fontSize: 17,
		fontWeight: 'bold',
		color: '#333',
	},
	cardDistance: {
		fontSize: 13,
		color: '#666',
		marginTop: 4,
	},
	cardPrice: {
		fontSize: 13,
		color: '#333',
		marginTop: 2,
	},
	detailButton: {
		marginTop: 8,
		backgroundColor: '#31c585',
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 6,
		alignSelf: 'flex-start',
	},
});
