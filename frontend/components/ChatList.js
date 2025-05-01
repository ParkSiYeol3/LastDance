// components/ChatList.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Footer from '../components/Footer';
import { Dimensions } from 'react-native';
import ChatListItem from './ChatListItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../firebase-config';

const { height } = Dimensions.get('window');

const ChatList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        // 토큰 가져오기
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          Alert.alert('오류', '로그인이 필요합니다.');
          return;
        }

        // ===== 프로필 포함된 채팅방 목록 조회 =====
        const res = await axios.get(
          `${API_URL}/api/chat/rooms/with-profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChatRooms(res.data.rooms || []);
      } catch (err) {
        console.error('채팅방 목록 조회 실패:', err);
        Alert.alert('오류', '채팅방 목록을 불러오지 못했습니다.');
      }
    };

    fetchChatRooms();
  }, []);

  const renderItem = ({ item }) => {
    // createdAt 이 Timestamp 객체라면 seconds로, 아니라면 Date 문자열로 처리
    const time = item.createdAt
      ? new Date(
          item.createdAt._seconds
            ? item.createdAt._seconds * 1000
            : item.createdAt
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ChatRoom', { roomId: item.id })
        }
      >
        <ChatListItem
          name={item.opponent?.nickname || '알 수 없는 사용자'}
          time={time}
          message={item.lastMessage || ''}
          imageUrl={''}
          profileImageUrl={item.opponent?.profileImage || ''}
          unreadCount={item.unreadCount ?? 0}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>채팅 목록</Text>
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text>채팅방이 없습니다.</Text>}
        />
      </View>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  footer: { position: 'absolute', bottom: 0, width: '100%', height: height * 0.115 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
