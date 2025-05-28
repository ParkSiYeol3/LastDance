import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ScrollView, Alert } from 'react-native';
import Footer from '../components/Footer';
import { getAuth, signOut } from 'firebase/auth';

const Settings = ({ navigation }) => {
  const [alarm1, setAlarm1] = useState(false);
  const [alarm2, setAlarm2] = useState(false);
  const [alarm3, setAlarm3] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setEmail(user.email);
      }
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      Alert.alert('로그아웃 완료', '다시 로그인 화면으로 이동합니다.');
      navigation.replace('Login'); // 혹은 navigation.navigate('Login')
    } catch (err) {
      Alert.alert('오류', err.message);
    }
  };
  
  return (
    <View style={styles.screen}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <TouchableOpacity>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 계정 정보 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>계정 정보</Text>
          <Text style={styles.cardDesc}>비밀번호로 변경하실 수 없습니다.</Text>
          <Text style={styles.text}>아이디 : {email || '알 수 없음'}</Text>
          <Text style={styles.text}>비밀번호 : ********</Text>
        </View>

        {/* 알림 관리 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>알림 관리</Text>
          <Text style={styles.cardDesc}>앱을 실행 중이지 않아도 알림을 받을 수 있어요!</Text>

          <View style={styles.switchRow}>
            <Text style={styles.infoText}>알람 설정</Text>
            <Switch value={alarm1} onValueChange={setAlarm1} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.infoText}>이벤트 알림</Text>
            <Switch value={alarm2} onValueChange={setAlarm2} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.infoText}>마케팅 수신 동의</Text>
            <Switch value={alarm3} onValueChange={setAlarm3} />
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>앱 정보</Text>
          <Text style={styles.infoText}>버전: 1.0.0</Text>
          <Text style={styles.infoText}>개발자: 이거옷대여?</Text>
          <Text style={styles.infoText}>문의: lastdance@naver.com</Text>
        </View>

        <View style={styles.card}>
        <Text style={styles.cardTitle}>계정 관리</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('회원 탈퇴 안내', '탈퇴를 원하시면 이메일로 문의해주세요.')}>
          <Text style={styles.deleteText}>회원 탈퇴 안내</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  backArrow: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuIcon: {
    fontSize: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#777',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginVertical: 6,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  paymentBox: {
    width: 100,
    height: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIcon: {
    width: 36,
    height: 36,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  paymentText: {
    fontSize: 12,
    color: '#444',
  },
  placeholderBox: {
    width: 32,
    height: 32,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  logoutText: {
    color: '#1e90ff',
    fontSize: 14,
    fontWeight: '500',
    marginVertical: 6,
  },
  deleteText: {
    color: '#f44336',
    fontSize: 13,
    marginTop: 4,
  },
});
