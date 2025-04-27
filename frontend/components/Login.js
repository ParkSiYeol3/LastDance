import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import Footer from '../components/Footer';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // ✅ 페이지 이동용

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력하세요!');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Firebase 토큰 가져오기
      const token = await user.getIdToken();

      // ✅ AsyncStorage에 저장
      await AsyncStorage.setItem('accessToken', token);

      Alert.alert('성공', '로그인 성공!');
      router.replace('/home'); // 🔥 로그인 성공 후 이동할 화면
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('로그인 실패', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 이메일 입력 */}
      <View style={styles.container1}>
        <TextInput
          style={styles.input}
          placeholder="Username or E-mail"
          value={email}
          onChangeText={setEmail} // ✅ 이메일 입력 반영
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View>
          아이디 비밀번호를 찾으시겠습니까?
        </View>

        {/* 비밀번호 입력 */}
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword} // ✅ 비밀번호 입력 반영
          secureTextEntry
        />
      </View>

      <View style={styles.container1}>
        {/* 로그인 버튼 */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        {/* 회원가입 버튼 */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>REGISTER</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container2}>
        {/* 푸터바가 들어갈 공간 */}
        <Footer navigation={router} />
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
