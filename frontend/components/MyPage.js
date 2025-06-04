import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ScrollView, Alert } from 'react-native';
import Footer from '../components/Footer';
import gearIcon from '../assets/gear.png';
import { db } from '../firebase-config';
import { getDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const MyPage = ({ navigation }) => {
	const [userData, setUserData] = useState(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const userId = await AsyncStorage.getItem('userId');
				if (!userId) {
					console.log('userId 없음');
					return;
				}
				const userDocRef = doc(db, 'users', userId);
				const userDocSnap = await getDoc(userDocRef);
				if (userDocSnap.exists()) {
					setUserData(userDocSnap.data());
				} else {
					console.log('사용자 데이터 없음');
				}
			} catch (error) {
				console.error('사용자 정보 가져오기 실패:', error);
			}
		};
		fetchUserData();
	}, []);

	const openSettings = () => {
		navigation.navigate('Settings');
	};

	const handleCamera = async () => {
		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			quality: 1,
		});

		if (!result.canceled && result.assets.length > 0) {
			const imageUri = result.assets[0].uri;

			const formData = new FormData();
			formData.append('image', {
				uri: imageUri,
				type: 'image/jpeg',
				name: 'photo.jpg',
			});

			try {
				const response = await fetch('http://192.168.1.173:8082/predict', {
					method: 'POST',
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					body: formData,
				});

				const data = await response.json();

				if (data.predictions && data.predictions.length > 0) {
					const summary = data.predictions.map((p) => `ID: ${p.class_id}, 확률: ${(p.confidence * 100).toFixed(1)}%`).join('\n');
					Alert.alert('AI 감지 결과', summary);
				} else {
					Alert.alert('AI 감지 결과', '감지된 얼룩이 없습니다.');
				}
			} catch (err) {
				console.error(err);
				Alert.alert('서버 오류', 'Flask 서버 연결 실패');
			}
		}
	};

	if (!userData) {
		return (
			<View style={styles.screen}>
				<StatusBar barStyle='dark-content' />
				<Text>로딩 중...</Text>
			</View>
		);
	}

	return (
		<View style={styles.screen}>
			<StatusBar barStyle='dark-content' />

			<View style={styles.profileBox}>
				<Image
					source={{
						uri: userData.profileImage || 'https://via.placeholder.com/60',
					}}
					style={styles.profileImage}
				/>
				<View style={styles.profileInfo}>
					<Text style={styles.nickname}>{userData.name} 님</Text>
					<Text style={styles.trust}>
						<Image source={require('../assets/star.png')} style={styles.starIcon} />
						{userData.trustScore ?? '0.0'}
					</Text>
				</View>
				<TouchableOpacity onPress={openSettings} style={styles.gearButton}>
					<Image source={gearIcon} style={styles.gearIcon} />
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.menuBox}>
					<MenuItem label='🧾 보증금 결제 내역' onPress={() => navigation.navigate('SalesHistory')} />
					<MenuItem label='♥️ 좋아요' onPress={() => navigation.navigate('Favorites')} />
					<MenuItem label='🕒 최근 본 상품' onPress={() => navigation.navigate('RecentViews')} />
					<MenuItem label='📢 공지사항' onPress={() => navigation.navigate('Notice')} />
					<MenuItem label='📩 승인 요청 내역' onPress={() => navigation.navigate('RentalRequests')} />
				</View>

				{userData.role === 'admin' && (
					<>
						<TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('AdminDashboard')}>
							<Text style={styles.adminButtonText}>📊 관리자 통계 보기</Text>
						</TouchableOpacity>

						<TouchableOpacity style={[styles.adminButton, { marginTop: 12 }]} onPress={() => navigation.navigate('AdminReports')}>
							<Text style={styles.adminButtonText}>🚨 신고 내역 관리</Text>
						</TouchableOpacity>

						<TouchableOpacity style={[styles.adminButton, { marginTop: 12 }]} onPress={handleCamera}>
							<Text style={styles.adminButtonText}>📷 얼룩 감지 테스트</Text>
						</TouchableOpacity>
					</>
				)}
			</ScrollView>

			<View style={styles.footer}>
				<Footer navigation={navigation} />
			</View>
		</View>
	);
};

const MenuItem = ({ label, onPress }) => (
	<TouchableOpacity onPress={onPress} style={styles.menuItem}>
		<Text style={styles.menuText}>{label}</Text>
		<Text style={styles.menuArrow}>›</Text>
	</TouchableOpacity>
);

export default MyPage;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	content: {
		padding: 20,
		paddingBottom: 100,
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		height: 85,
		width: '100%',
	},
	profileBox: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#e8f0fe',
		padding: 20,
		borderRadius: 50,
		marginTop: 10,
		marginBottom: 20,
	},
	profileImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
		marginRight: 16,
	},
	profileInfo: {
		flex: 1,
	},
	nickname: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	trust: {
		fontSize: 14,
		color: '#666',
		marginTop: 4,
	},
	starIcon: {
		width: 15,
		height: 15,
	},
	gearButton: {
		padding: 6,
	},
	gearIcon: {
		width: 22,
		height: 22,
		resizeMode: 'contain',
	},
	menuBox: {
		borderTopWidth: 1,
		borderColor: '#eee',
		marginTop: 12,
	},
	menuItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderColor: '#eee',
	},
	menuText: {
		fontSize: 16,
	},
	menuArrow: {
		fontSize: 20,
		color: '#999',
	},
	adminButton: {
		marginTop: 20,
		backgroundColor: '#4CAF50',
		padding: 12,
		borderRadius: 10,
		alignItems: 'center',
	},
	adminButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
});
