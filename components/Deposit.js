// components/Deposit.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Footer from '../components/Footer';

const Deposit = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.levelText}>내등급 : Lv3</Text>
          <Text style={styles.subText}>내 등급을 알수있습니다</Text>
          <Text style={styles.pointText}>현재 포인트: XXXX / 10000</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보증금 금액 안내</Text>
          <Text style={styles.sectionDesc}>보증금 관련된 안내를 받으세요.</Text>
          <Text style={styles.detailText}>• 기본적으로 1만원에서 10만원 까지 설정 가능</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보증금 반환 안내</Text>
          <Text style={styles.sectionDesc}>보증금 반환 관련된 안내를 받으세요.</Text>
          <Text style={styles.detailText}>• 거래가 성사되고 반납까지 할경우 보증금 반환 완료</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>거래 확인 하기</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Deposit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 15,
    marginBottom: 10,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subText: {
    color: '#666',
    marginTop: 5,
  },
  pointText: {
    fontSize: 15,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4DD597',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
