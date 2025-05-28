import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native';
import Footer from '../components/Footer';
import gearIcon from '../assets/gear.png';
import { db } from '../firebase-config';
import { getDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

	if (!userData) {
		return (
			<View style={styles.screen}>
				<StatusBar barStyle="dark-content" />
				<Text>로딩 중...</Text>
			</View>
		);
	}

	return (
		<View style={styles.screen}>
			<StatusBar barStyle="dark-content" />
				{/* 프로필 박스 */}
				<View style={styles.profileBox}>
					<Image
						source={{ uri: userData.profileImage || 'https://via.placeholder.com/60' }}
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
				<View style={styles.menuList}>
					<MenuItem label="🧾 거래 내역" onPress={() => navigation.navigate('SalesHistory')} />
					<MenuItem label="♥️ 좋아요" onPress={() => navigation.navigate('Favorites')} />
					<MenuItem label="💳 보증금 결제 수단" onPress={() => navigation.navigate('Deposit')} />
					<MenuItem label="👤 등급별 혜택 안내" onPress={() => navigation.navigate('Rank')} />
					<MenuItem label="📢 공지사항" onPress={() => navigation.navigate('Notice')} />
					<MenuItem label="📩 승인 요청 내역" onPress={() => navigation.navigate('RentalRequests')} />
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<Footer navigation={navigation} />
			</View>
		</View>
	);
};

const MenuItem = ({ label, onPress }) => (
	<TouchableOpacity style={styles.menuItem} onPress={onPress}>
		<Text style={styles.menuText}>{label}</Text>
		<Text style={styles.arrow}>{'>'}</Text>
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
		height: 90,
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
	starIcon:{
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
	summaryBox: {
		backgroundColor: '#31c585',
		padding: 16,
		borderRadius: 10,
		marginBottom: 20,
	},
	summaryTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	summaryButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	smallButton: {
		flex: 1,
		backgroundColor: '#ffffff',
		borderRadius: 6,
		paddingVertical: 10,
		alignItems: 'center',
		marginHorizontal: 5,
		borderWidth: 1,
		borderColor: '#ccc',
	},
	menuList: {
		marginTop: 10,
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
	arrow: {
		fontSize: 18,
		color: '#999',
	},
});
