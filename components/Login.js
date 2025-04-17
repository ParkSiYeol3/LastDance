import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import Footer from '../components/Footer';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 이메일 입력 */}
      <View style={styles.container1}>
        <TextInput style={styles.input} placeholder="Username or E-mail" />
        <View>
        아이디 비밀번호를 찾으시겠습니까?
        </View>

      {/* 비밀번호 입력 */}
        <TextInput style={[styles.input, styles.passwordInput]} placeholder="Password" secureTextEntry />
      </View>

      <View style={styles.container1}>
      {/* 로그인 버튼 */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* 회원가입 버튼 */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>REGISTER</Text>
      </TouchableOpacity>
      </View>


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
  
  },

  container1:{
    width:'100%',
    justifyContent: 'center',
    alignItems: 'center',
    display:'flex',
    marginBottom: 50,
  },

  container2:{
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
    marginBottom:50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});