// components/Rank.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Footer from '../components/Footer';

const { width } = Dimensions.get('window');

const Rank = () => {
  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.back}>{'←'}</Text>
        <Text style={styles.title}>등급안내</Text>
        <Text style={styles.menu}>≡</Text>
      </View>

      {/* 내 등급 정보 */}
      <View style={styles.levelBox}>
        <Text style={styles.levelText}>내등급 : Lv3</Text>
        <Text style={styles.subText}>내 등급을 알수있습니다</Text>
        <Text style={styles.pointText}>현재 포인트: XXXX / 10000</Text>
      </View>

      {/* 혜택 정보 */}
      <View style={styles.benefitBox}>
        <Text style={styles.benefitTitle}>등급별 혜택</Text>
        <Text style={styles.benefitDesc}>등급별로 혜택을 확인하실 수 있습니다.</Text>
        {['5', '4', '3', '2', '1'].map((level) => (
          <Text key={level} style={styles.benefitText}>
            Lv. {level} : 보증금 면제, 수수료 2%로 절감
          </Text>
        ))}
      </View>

      {/* FIND 버튼 */}
      <View style={styles.container2}>
        {/* 푸터바가 들어갈 공간 */}
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Rank;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  back: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menu: {
    fontSize: 20,
  },
  levelBox: {
    padding: 20,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subText: {
    marginTop: 5,
    color: '#666',
  },
  pointText: {
    marginTop: 10,
    fontSize: 16,
  },
  benefitBox: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  benefitDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    marginBottom: 5,
  },
  container2:{
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
