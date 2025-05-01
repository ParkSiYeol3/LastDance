import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, Dimensions } from 'react-native';

// 아이콘 이미지 임포트
import homeIcon from '../assets/home.png';
import mapIcon from '../assets/map.png';
import chatIcon from '../assets/chat.png';
import mypageIcon from '../assets/mypage.png';

const {  width, height } = Dimensions.get('window');

export default function Footer({ navigation }) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Home')}>
        <Image source={homeIcon} style={styles.icon} />
        <Text style={styles.label}>홈</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Map')}>
        <Image source={mapIcon} style={styles.icon} />
        <Text style={styles.label}>지도</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('ChatList')}>
        <Image source={chatIcon} style={styles.icon} />
        <Text style={styles.label}>채팅</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('MyPage')}>
        <Image source={mypageIcon} style={styles.icon} />
        <Text style={styles.label}>마이페이지</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: height * 0.11,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%', 
  },
  icon: {
    width: width * 0.08,
    height: height * 0.04,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#333',
  },
});