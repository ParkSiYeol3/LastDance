import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import Footer from '../components/Footer';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function App() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigation = useNavigation();

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert('알림', '이메일과 비밀번호를 입력하세요!');
			return;
		}

		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// ✅ 토큰과 UID 모두 저장
			const token = await user.getIdToken();
			await AsyncStorage.setItem('accessToken', token);
			await AsyncStorage.setItem('userId', user.uid); // 🔥 추가

			// ✅ 직접 필요한 정보만 저장
			const currentUserInfo = {
				uid: user.uid,
				email: user.email,
			};

			await AsyncStorage.setItem('currentUser', JSON.stringify(user));

			Alert.alert('성공', '로그인 성공!');
			navigation.replace('Home');
		} catch (error) {
			console.error('로그인 오류:', error);
			Alert.alert('로그인 실패', error.message);
		}
	};
	return (
		<View style={styles.container}>
			<StatusBar barStyle='dark-content' />

			<View style={styles.container1}>
				<TextInput style={styles.input} placeholder='Username or E-mail' value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' />
				<View>아이디 또는 비밀번호를 찾으시겠습니까?</View>

				<TextInput style={[styles.input, styles.passwordInput]} placeholder='Password' value={password} onChangeText={setPassword} secureTextEntry />
			</View>

			<View style={styles.container1}>
				<TouchableOpacity style={styles.button} onPress={handleLogin}>
					<Text style={styles.buttonText}>로그인</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
					<Text style={styles.buttonText}>회원가입</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.container2}>
				<Footer navigation={navigation} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	container1: {
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		display: 'flex',
		marginBottom: 50,
	},
	container2: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
	},
	input: {
		width: '80%',
		height: 50,
		borderWidth: 1,
		borderColor: '#1E355E',
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 15,
	},
	passwordInput: {
		borderColor: '#E53935',
	},
	button: {
		width: '80%',
		height: 50,
		backgroundColor: '#31c585',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		marginVertical: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
		marginBottom: 50,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
});
