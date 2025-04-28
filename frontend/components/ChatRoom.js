// components/ChatRoom.js
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchMessages,
  sendMessage,
  markMessageAsRead,
} from '../components/ChatService';

const ChatRoom = ({ route }) => {
  // route.params 에 어떤 키로 넘어오든 모두 시도해서 roomId 를 잡아낸다
  const {
    roomId: paramRoomId,
    chatRoomId,
    id: directId,
  } = route.params || {};
  const roomId = paramRoomId ?? chatRoomId ?? directId ?? null;

  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // 디버그용: params 확인
  useEffect(() => {
    console.log('[ChatRoom] route.params=', route.params, '→ roomId=', roomId);
  }, [route.params]);

  // 1) 로그인된 유저 ID 가져오기
  useEffect(() => {
    AsyncStorage.getItem('userId')
      .then(uid => {
        if (uid) setUserId(uid);
        else Alert.alert('알림', '로그인 후 이용해주세요.');
      })
      .catch(err => console.error('userId 가져오기 실패', err));
  }, []);

  // 2) roomId & userId 있을 때만 메시지 조회
  useEffect(() => {
    if (!roomId || !userId) return;

    const load = async () => {
      try {
        const msgs = await fetchMessages(roomId);
        setMessages(msgs);
      } catch (err) {
        console.error('메시지 불러오기 실패', err);
      }
    };

    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [roomId, userId]);

  // 3) 메시지 전송
  const onSend = async () => {
    if (!inputText.trim()) return;
    if (!roomId || !userId) {
      Alert.alert('오류', '잘못된 채팅방입니다.');
      return;
    }
    try {
      await sendMessage(roomId, userId, inputText);
      setInputText('');
      const msgs = await fetchMessages(roomId);
      setMessages(msgs);
    } catch (err) {
      console.error('메시지 전송 실패', err);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  };

  // 4) 읽음 처리
  const onRead = messageId => {
    if (!roomId) return;
    markMessageAsRead(roomId, messageId).catch(err =>
      console.error('읽음 처리 실패', err)
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, idx) => item.id || idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onRead(item.id)}
            style={
              item.senderId === userId
                ? styles.myMessage
                : styles.theirMessage
            }
          >
            <Text>{item.text}</Text>
            <Text style={styles.timeText}>
              {item.sentAt
                ? new Date(item.sentAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={<Text>아직 대화가 없습니다.</Text>}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요"
        />
        <TouchableOpacity style={styles.button} onPress={onSend}>
          <Text style={styles.buttonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  timeText: {
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
  button: {
    marginLeft: 8,
    backgroundColor: '#31C585',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
