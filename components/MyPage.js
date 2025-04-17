import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import Footer from '../components/Footer';
import gearIcon from '../assets/gear.png'; // 이미지 경로는 실제 위치에 맞게 조정!

const MyPage = ({ navigation }) => {
  const openSettings = () => {
    console.log('설정창 열기');
    navigation.navigate('Settings'); // 실제 설정 페이지로 이동
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* 톱니바퀴 버튼 */}
      <TouchableOpacity style={styles.gearButton} onPress={openSettings}>
        <Image source={gearIcon} style={styles.gearIcon} />
      </TouchableOpacity>

      {/* 내용 영역 */}
      <View style={styles.container1}>
        <View style={styles.profileBox}>
          <Text style={styles.profileText}>고윤재 Lv. 8 gold</Text>
          <Text style={styles.addressText}>
            주소 충남 천안시 서북구 oo로 00, xx아파트{'\n'}xxx동 xxxx호
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SalesHistory')}><Text>🧾 거래 내역</Text></TouchableOpacity>
        <TouchableOpacity 
  style={styles.button} 
  onPress={() => navigation.navigate('Favorites')} // 여기를 추가
>
  <Text>⭐ 즐겨찾기</Text>
</TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Deposit')} ><Text>💳 보증금 결제 수단</Text> </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Rank')} ><Text>👤 등급별 혜택 안내</Text> </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Notice')} ><Text>👤 공지사항</Text> </TouchableOpacity>
      </View>

      {/* 푸터바 */}
      <View style={styles.container2}>
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
  container2: {
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
    color: '#1e272e'
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
