import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { useNavigation } from '@react-navigation/native';


export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [nickname, setNickname] = useState('');
  const navigation = useNavigation();

  
  const handleRegister = async () => {
    if (!email || !password || !name || !address || !nickname) {
      Alert.alert('알림', '모든 필수 입력값을 채워주세요.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore에 추가 정보 저장
      await setDoc(doc(db, 'users', user.uid), {
        email,
        phone,       // 옵션
        name,
        address,
        nickname,
      });

      Alert.alert('성공', '회원가입이 완료되었습니다!');
      navigation.replace('Login'); // 로그인 페이지로 이동
    } catch (error) {
      console.error('회원가입 오류:', error);
      Alert.alert('회원가입 실패', error.message);
    }
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.BackButton}>
        <Text style={styles.BackText}>‹ 로그인</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>회원가입</Text>

      <TextInput style={styles.input} placeholder="Username or E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={[styles.input, styles.passwordInput]} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Phone Number (선택)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="Nick Name" value={nickname} onChangeText={setNickname} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>완료</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  BackButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 10,
  },
  BackText: {
    fontSize: 16, 
    color: '#31c585', 
    fontWeight: 'bold'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '90%', // 반응형
    height: 50,
    borderWidth: 1,
    borderColor: '#1E355E',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  passwordInput: {
    borderColor: '#E53935', // 비밀번호 입력창 빨간색
  },
  button: {
    width: '90%',
    height: 50,
    backgroundColor: '#31c585',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000', // 그림자 추가
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android 그림자
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container2:{
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});