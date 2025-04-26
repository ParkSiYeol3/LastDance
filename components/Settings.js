import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import Footer from '../components/Footer';

const Settings = ({ navigation }) => {
  const [alarm1, setAlarm1] = useState(false);
  const [alarm2, setAlarm2] = useState(false);
  const [alarm3, setAlarm3] = useState(false);

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

      {/* 계정 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정 정보</Text>
        <Text style={styles.sectionDescription}>비밀번호로 변경하실 수 없습니다.</Text>
        <Text style={styles.text}>아이디 : nutguy10@naver.com</Text>
        <Text style={styles.text}>비밀번호 : ***********</Text>
      </View>

      {/* 알림 관리 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림 관리</Text>
        <Text style={styles.sectionDescription}>
          이 앱을 실행 중이 아니어도 관련 알림을 받을 수 있습니다!
        </Text>
        <View style={styles.switchRow}>
          <Text style={styles.text}>알람 설정</Text>
          <Switch value={alarm1} onValueChange={setAlarm1} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.text}>이벤트 알림</Text>
          <Switch value={alarm2} onValueChange={setAlarm2} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.text}>알람 설정</Text>
          <Switch value={alarm3} onValueChange={setAlarm3} />
        </View>
      </View>

      {/* 결제 수단 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>결제 수단</Text>
        <View style={styles.paymentRow}>
          <View style={styles.paymentBox}>
            <Image source={require('../assets/toss.png')} style={styles.paymentIcon} />
            <Text>토스 페이</Text>
          </View>
          <View style={styles.paymentBox}>
            <Image source={require('../assets/card.png')} style={styles.paymentIcon} />
            <Text>신용 카드</Text>
          </View>
          <View style={styles.paymentBox}>
            <View style={styles.placeholderBox} />
          </View>
        </View>
      </View>

      {/* 하단 푸터 */}
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
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.8,
    borderColor: '#ccc',
  },
  backArrow: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuIcon: {
    fontSize: 22,
  },
  section: {
    padding: 20,
    borderBottomWidth: 0.8,
    borderColor: '#ccc',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  paymentBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  placeholderBox: {
    width: 32,
    height: 32,
    backgroundColor: '#fceaea',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
