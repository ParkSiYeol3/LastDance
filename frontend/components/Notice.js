import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Footer from '../components/Footer';

const notices = [
  { id: 1, title: '[공지] 더 좋은 서비스 제공을 위해 이용약관이 변경될 예정이에요.', date: '2025.05.25' },
  { id: 2, title: '[공지] 개인 정보 처리 방침이 개정될 예정이에요.', date: '2025.04.07' },
  { id: 3, title: '사용자 권리 보장을 강화하기 위해 개인 정보 처리 방침이 변경될 예정이에요.', date: '2025.03.18' },
  { id: 4, title: '[공지] 위치기반 서비스 이용약관이 개정될 예정이에요.', date: '2025.03.18' },
];

const Notice = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotices = notices.filter((notice) =>
    notice.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>공지사항</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="공지사항 검색"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {filteredNotices.map((notice) => (
          <TouchableOpacity key={notice.id} style={styles.noticeCard}>
            <Text style={styles.noticeTitle} numberOfLines={2}>
              {notice.title}
            </Text>
            <Text style={styles.noticeDate}>{notice.date}</Text>
          </TouchableOpacity>
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
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  noticeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1, // Android
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  noticeDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
