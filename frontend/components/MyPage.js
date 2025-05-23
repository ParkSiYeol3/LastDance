import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import Footer from '../components/Footer';
import gearIcon from '../assets/gear.png';
import { db } from '../firebase-config'; // ✅ Firestore 연결
import { getDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyPage = ({ navigation }) => {
	const [userData, setUserData] = useState(null); // 사용자 데이터

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const userId = await AsyncStorage.getItem('userId'); // 저장된 userId 가져오기
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

			{/* 톱니바퀴 버튼 */}
			<TouchableOpacity style={styles.gearButton} onPress={openSettings}>
				<Image source={gearIcon} style={styles.gearIcon} />
			</TouchableOpacity>

			{/* 내용 영역 */}
			<View style={styles.container1}>
				<View style={styles.profileBox}>
					<Text style={styles.profileText}>{userData.name} 님</Text>
					<Text style={styles.addressText}>
						이메일: {userData.email}
						{'\n'}
						우편번호: {userData.zipcode}
						{'\n'}
						주소: {userData.address}
					</Text>
				</View>

				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SalesHistory')}>
					<Text>🧾 거래 내역</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Favorites')}>
					<Text>⭐ 즐겨찾기</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Deposit')}>
					<Text>💳 보증금 결제 수단</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Rank')}>
					<Text>👤 등급별 혜택 안내</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Notice')}>
					<Text>📢 공지사항</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RentalRequests')}>
					<Text>📩 승인 요청 내역</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.footer}>
				<Footer navigation={navigation} />
			</View>
		</View>
	);
};

export default MyPage;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#ffffff',
		alignItems: 'center',
	},
	container1: {
		width: '100%',
		paddingTop: 30,
		paddingBottom: 100, // Footer 공간 확보
		alignItems: 'center',
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
	},
	profileBox: {
		width: '90%',
		backgroundColor: '#E7EFF6',
		padding: 15,
		borderColor: '#000000',
		borderWidth: 1,
		borderRadius: 10,
		marginBottom: 20,
		elevation: 3,
	},
	profileText: {
		fontWeight: 'bold',
		marginBottom: 5,
		color: '#1e272e',
	},
	addressText: {
		fontSize: 12,
		color: '#1e272e',
	},
	button: {
		width: '90%',
		height: 45,
		backgroundColor: '#E7EFF6',
		borderColor: '#000000',
		borderWidth: 1,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 6,
		marginBottom: 15,
		elevation: 2,
	},
	gearButton: {
		position: 'absolute',
		top: 20,
		right: 20,
		zIndex: 10,
		padding: 10,
	},
	gearIcon: {
		width: 24,
		height: 24,
		resizeMode: 'contain',
	},
});
