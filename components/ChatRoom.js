import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ChatRoom = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([
    { id: '1', sender: '시열', text: '안녕하세요!' },
    { id: '2', sender: '영훈', text: '안녕하세요! 옷 대여 보고 연락드렸어요.' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: '나',
      text: inputText,
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.sender === '나' ? styles.myMessage : styles.theirMessage}>
            <Text>{item.text}</Text>
          </View>
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
});