// ChatRoom.js (수정된 버전)
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { sendMessage, markMessageAsRead } from '../components/ChatService';

const ChatRoom = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const currentUserId = 'USER_123'; // TODO: 실제 로그인 유저 ID로 교체

  // 실시간 메시지 불러오기
  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('sentAt'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,  // 메시지 ID 추가
        text: doc.data().text || '',
        senderId: doc.data().senderId || '',
        timestamp: doc.data().sentAt
          ? new Date(doc.data().sentAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [roomId]);

  // 메시지 전송
  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      await sendMessage(roomId, currentUserId, inputText);
      setInputText('');
    } catch (err) {
      console.error('메시지 전송 실패:', err);
    }
  };

  // 메시지 읽음 처리
  const handleRead = async (messageId) => {
    try {
      await markMessageAsRead(roomId, messageId);
    } catch (err) {
      console.error('읽음 처리 실패:', err);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}  // 메시지 ID로 keyExtractor 설정
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleRead(item.id)}
            style={item.senderId === currentUserId ? styles.myMessage : styles.theirMessage}
          >
            <Text>{item.text}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.timeText}>{item.timestamp}</Text>
            </View>
          </TouchableOpacity>
        )}
        style={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요"
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageList: { padding: 10 },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: '80%',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#31C585',
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendText: { color: '#fff' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#555',
    marginRight: 6,
  },
});
