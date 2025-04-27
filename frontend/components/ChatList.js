import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Footer from '../components/Footer';
import ChatListItem from './ChatListItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../firebase-config';

const ChatList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          Alert.alert('오류', '로그인이 필요합니다.');
          return;
        }

        const response = await axios.get(`${API_URL}/api/chat/rooms/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setChatRooms(response.data.rooms || []);
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error);
        Alert.alert('오류', '채팅방 목록을 불러오지 못했습니다.');
      }
    };

    fetchChatRooms();
  }, []);

  const renderItem = ({ item }) => {
    const time = item.lastMessageTime
      ? new Date(item.lastMessageTime._seconds ? item.lastMessageTime._seconds * 1000 : item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
  
    return (
      <TouchableOpacity
        key={item.chatRoomId}   // ✅ 여기 key 추가!
        onPress={() => navigation.navigate('ChatRoom', { roomId: item.chatRoomId })}
      >
        <ChatListItem
          name={item.opponent?.nickname || '상대방'}
          time={time}
          message={item.lastMessage || ''}
          imageUrl={''}
          profileImageUrl={item.opponent?.profileImage || ''}
          unreadCount={item.unreadCount || 0}
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
          keyExtractor={(item) => item.chatRoomId}
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
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  footer: { position: 'absolute', bottom: 0, width: '100%', height: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
