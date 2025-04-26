// components/Notice.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Footer from '../components/Footer';

const notices = [
  { id: 1, title: '[공지] 더 좋은 서비스 제공을 위해 이용약관이 변경될 예정이에요.', date: '2025.04.04' },
  { id: 2, title: '[공지] 개인 정보 처리 방침이 개정될 예정이에요.', date: '2025.03.19' },
  { id: 3, title: '사용자 권리 보장을 강화하기 위해 개인 정보 처리 방침이 변경될 예정이에요.', date: '2025.03.18' },
  { id: 4, title: '[공지] 위치기반 서비스 이용약관이 개정될 예정이에요.', date: '2025.03.18' },
];

const Notice = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>공지사항</Text>
        {notices.map((notice) => (
          <View key={notice.id} style={styles.noticeItem}>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeDate}>{notice.date}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Notice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  noticeItem: {
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 15,
  },
  noticeTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  noticeDate: {
    fontSize: 13,
    color: '#888',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
