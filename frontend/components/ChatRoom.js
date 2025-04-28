// components/ChatRoom.js
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  fetchMessages,
  sendMessage,
  markMessageAsRead,
} from '../components/ChatService';
import { API_URL } from '../firebase-config';

const ChatRoom = ({ route }) => {
  const { roomId } = route.params;
  const [userId, setUserId] = useState(null);
  const [participants, setParticipants] = useState({}); 
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // 1) 내 UID 로드
  useEffect(() => {
    AsyncStorage.getItem('userId')
      .then(uid => {
        if (!uid) Alert.alert('알림', '로그인 후 이용해주세요.');
        else setUserId(uid);
      })
      .catch(console.error);
  }, []);

  // 2) 프로필 포함 채팅방 정보(fetch profile) — 상대방 UID, 프로필 이미지
  useEffect(() => {
    if (!userId || !roomId) return;
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(
          `${API_URL}/api/chat/rooms/with-profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // 이 방 ID 에 해당하는 room 객체 찾기
        const room = res.data.rooms.find(r => r.id === roomId);
        if (!room) return;
        // participants 맵 구성
        const map = {};
        map[userId] = {
          nickname: '나',
          profileImage: null, // 원한다면 내 프로필도 불러와서 세팅
        };
        map[room.opponent.uid] = {
          nickname: room.opponent.nickname,
          profileImage: room.opponent.profileImage,
        };
        setParticipants(map);
      } catch (err) {
        console.error('방 프로필 조회 실패:', err);
      }
    })();
  }, [userId, roomId]);

  // 3) 메시지 로드 (2초마다)
  useEffect(() => {
    if (!userId || !roomId) return;
    const load = async () => {
      try {
        const msgs = await fetchMessages(roomId);
        setMessages(msgs);
      } catch (err) {
        console.error('메시지 로드 실패:', err);
      }
    };
    load();
    const iv = setInterval(load, 2000);
    return () => clearInterval(iv);
  }, [userId, roomId]);

  // 4) 메시지 전송
  const onSend = async () => {
    if (!inputText.trim()) return;
    try {
      await sendMessage(roomId, userId, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error('메시지 전송 실패:', err);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  };

  // 5) 읽음 처리
  const onRead = messageId => {
    if (!roomId) return;
    markMessageAsRead(roomId, messageId).catch(console.error);
  };

  // 메시지 한 줄 렌더러
  const renderItem = ({ item }) => {
    const isMe = item.senderId === userId;
    const profile = participants[item.senderId] || {};
    return (
      <View
        style={[
          styles.row,
          isMe ? styles.rowRight : styles.rowLeft
        ]}
      >
        {/* 왼쪽(상대)일 때만 아바타 */}
        {!isMe && (
          <Image
            source={
              profile.profileImage
                ? { uri: profile.profileImage.replace(/^"(.*)"$/, '$1') }
                : require('../assets/profile.png')
            }
            style={styles.avatar}
          />
        )}

        <TouchableOpacity
          onPress={() => onRead(item.id)}
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther
          ]}
        >
          <Text style={styles.text}>{item.text}</Text>
          <Text style={styles.time}>
            {new Date(item.sentAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>

        {/* 오른쪽(나)일 때만 아바타 */}
        {isMe && (
          <Image
            source={
              profile.profileImage
                ? { uri: profile.profileImage.replace(/^"(.*)"$/, '$1') }
                : require('../assets/profile.png')
            }
            style={styles.avatar}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        inverted
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  bubble: {
    maxWidth: '70%',
    padding: 8,
    borderRadius: 8,
  },
  bubbleOther: { backgroundColor: '#f8d7da', marginRight: 4 },
  bubbleMe: { backgroundColor: '#d1e7dd', marginLeft: 4 },
  text: { fontSize: 14 },
  time: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#31C585',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: 'bold' },
});
