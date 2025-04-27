import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import Footer from '../components/Footer'; // Footer 추가



export default function FindAccount() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 타이틀 */}
      <Text style={styles.title}>Find</Text>

      {/* ID 입력 */}
      <TextInput style={styles.input} placeholder="ID" />

      {/* 이름 입력 */}
      <TextInput style={styles.input} placeholder="Name" />

      {/* 찾은 비밀번호 타이틀 */}
      <Text style={styles.foundPasswordTitle}>찾은 비밀번호</Text>

      {/* 찾은 비밀번호 표시 */}
      <TextInput
        style={[styles.input, styles.passwordInput]}
        placeholder="Password"
        secureTextEntry
        editable={false} // 편집 불가
      />

      {/* FIND 버튼 */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>FIND</Text>
      </TouchableOpacity>

      {/* 푸터바 공간 */}
      <View style={styles.container2}>
              {/* 푸터바가 들어갈 공간 */}
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%', // 반응형
    height: 50,
    borderWidth: 1,
    borderColor: '#1E355E',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordInput: {
    borderColor: '#E53935', // 비밀번호 입력창 빨간색
  },
  foundPasswordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  button: {
    width: '80%',
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
