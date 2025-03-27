// SignIn.js
import React, { useState } from 'react';
import { TextInput, Button, View, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // firebase 설정 파일 import

const SignIn = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSignIn = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			navigation.navigate('Home'); // 로그인 후 홈 화면으로 이동
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<View>
			<Text>로그인</Text>
			<TextInput placeholder='이메일' value={email} onChangeText={setEmail} keyboardType='email-address' />
			<TextInput placeholder='비밀번호' value={password} onChangeText={setPassword} secureTextEntry />
			<Button title='로그인' onPress={handleSignIn} />
			{error && <Text>{error}</Text>}
		</View>
	);
};

export default SignIn;
