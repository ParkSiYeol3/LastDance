import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../firebase-config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';

const ChatRoom = ({ route }) => {
  const { roomId } = route.params;

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const formattedHour = hours % 12 || 12;
    return `${period} ${formattedHour}:${minutes.toString().padStart(2, '0')}`;
  };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [rentalInfo, setRentalInfo] = useState(null);
  const currentUserId = 'USER_123'; // 실제 로그인 유저 ID로 교체 필요

  // ✅ Firestore 실시간 메시지 수신
  const markMessageAsRead = async (messageId) => {
    const messageRef = doc(db, 'chatRooms', roomId, 'messages', messageId);
    await updateDoc(messageRef, { isRead: true });
  };
  
  useEffect(() => {
    const q = query(
      collection(db, 'chatRooms', roomId, 'messages'),
      orderBy('timestamp')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const message = doc.data();
        const isOtherUser = message.sender !== currentUserId;
  
        // ✅ 상대방 메시지인데 읽지 않았다면 읽음 처리
        if (isOtherUser && !message.isRead) {
          markMessageAsRead(doc.id);
        }
  
        return {
          id: doc.id,
          ...message,
          timestamp: formatTime(message.timestamp?.toDate?.() || new Date()),
        };
      });
      setMessages(newMessages);
    });
  
    return () => unsubscribe();
  }, [roomId]);

  // ✅ 메시지 전송 → Firestore 저장
  const handleSend = async () => {
    if (!inputText.trim()) return;
    await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
      sender: currentUserId,
      text: inputText,
      isRead: false,
      timestamp: serverTimestamp(),
    });
    setInputText('');
  };

  // ✅ 거래 상태 확인 (보증금 상태)
  useEffect(() => {
    const fetchRental = async () => {
      const docRef = doc(db, 'rentals', roomId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setRentalInfo(snapshot.data());
      }
    };
    fetchRental();
  }, [roomId]);

  const isBuyer = currentUserId === rentalInfo?.buyerId;
  const isSeller = currentUserId === rentalInfo?.sellerId;
  const showPayButton = isBuyer && !rentalInfo?.isPaid;
  const showRefundButton = isSeller && rentalInfo?.isPaid && !rentalInfo?.isRefunded;

  const handleDeposit = () => {
    console.log('💳 보증금 결제 실행');
    // Stripe 연동
  };

  const handleRefund = () => {
    console.log('💸 보증금 환불 실행');
    // Stripe 연동
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={item.sender === currentUserId ? styles.myMessage : styles.theirMessage}
          >
            <Text>{item.text}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.timeText}>{item.timestamp}</Text>
              {item.sender === currentUserId && (
                <Text style={styles.readText}>{item.isRead ? '읽음' : '1'}</Text>
              )}
            </View>
          </View>
        )}
        style={styles.messageList}
      />

      {/* ✅ 조건부 보증금 버튼 추가 */}
      {showPayButton && (
        <TouchableOpacity style={styles.depositButton} onPress={handleDeposit}>
          <Text style={styles.buttonText}>보증금 결제</Text>
        </TouchableOpacity>
      )}
      {showRefundButton && (
        <TouchableOpacity style={styles.refundButton} onPress={handleRefund}>
          <Text style={styles.buttonText}>보증금 환급</Text>
        </TouchableOpacity>
      )}

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
  readText: {
    fontSize: 11,
    color: '#007AFF',
  },
  depositButton: {
    backgroundColor: '#3371EF',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  refundButton: {
    backgroundColor: '#1DC078',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});