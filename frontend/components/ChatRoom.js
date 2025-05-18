import React, { useEffect, useState, useCallback } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  fetchMessages,
  sendMessage,
  markMessageAsRead,
} from '../components/ChatService';
import { API_URL } from '../firebase-config';

const ChatRoom = ({ route }) => {
  const { roomId } = route.params;
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);
  const [participants, setParticipants] = useState({});
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [rentalItemId, setRentalItemId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [buyerId, setBuyerId] = useState(null);

  const isPaymentComplete = paymentStatus === 'created';

  useEffect(() => {
    AsyncStorage.getItem('userId')
      .then(uid => {
        if (!uid) Alert.alert('알림', '로그인 후 이용해주세요.');
        else setUserId(uid);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!userId || !roomId) return;
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(`${API_URL}/api/chat/rooms/with-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const room = res.data.rooms.find(r => r.id === roomId);
        if (!room) return;

        setIsSeller(room.sellerId === userId);
        setRentalItemId(room.rentalItemId);

        // 안전하게 buyerId 설정
        const buyerUid = room.sellerId === userId ? room.opponent.uid : userId;
        setBuyerId(buyerUid);

        const map = {};
        map[userId] = { profileImage: null };
        map[room.opponent.uid] = {
          profileImage: room.opponent.profileImage?.replace(/^"(.*)"$/, '$1'),
        };
        setParticipants(map);
      } catch (err) {
        console.error('방 프로필 조회 실패:', err);
      }
    })();
  }, [userId, roomId]);

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

  const reloadPaymentStatus = async () => {
    const targetId = isSeller ? buyerId : userId;
    console.log('🔍 상태 조회 요청:', { targetId, rentalItemId });

    try {
      const res = await axios.get(`${API_URL}/api/deposit/status`, {
        params: { userId: targetId, rentalItemId },
      });
      console.log('✅ 결제 상태 응답:', res.data.status);
      setPaymentStatus(res.data.status);
    } catch (err) {
      console.error('❌ 결제 상태 재조회 실패:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const shouldRun =
        (isSeller && buyerId && rentalItemId) ||
        (!isSeller && userId && rentalItemId);

      if (shouldRun) {
        console.log('🧪 reloadPaymentStatus 실행 조건 만족');
        reloadPaymentStatus();
      } else {
        console.log('⚠️ 아직 buyerId 또는 rentalItemId가 준비되지 않음');
      }
    }, [userId, buyerId, rentalItemId, isSeller])
  );

  const onSend = async () => {
    if (!inputText.trim()) return;
    try {
      await sendMessage(roomId, userId, inputText.trim(), 'text');
      setInputText('');
    } catch (err) {
      console.error('메시지 전송 실패:', err);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  };

  const onRead = messageId => {
    if (!roomId) return;
    markMessageAsRead(roomId, messageId).catch(console.error);
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === userId;
    const profile = participants[item.senderId] || {};

    return (
      <View style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}>
        {!isMe && (
          <Image
            source={
              profile.profileImage
                ? { uri: profile.profileImage }
                : require('../assets/profile.png')
            }
            style={styles.avatar}
          />
        )}

        <TouchableOpacity
          onPress={() => onRead(item.id)}
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
        >
          <Text style={styles.text}>{item.text}</Text>
          <Text style={styles.time}>
            {new Date(item.sentAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled
        style={{
          backgroundColor: isPaymentComplete ? '#4CAF50' : '#FFC107',
          padding: 10,
          margin: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{
          color: '#fff',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          {isPaymentComplete ? '✅ 보증금 결제 완료!' : '⚠️ 보증금 결제가 필요합니다!'}
        </Text>
      </TouchableOpacity>

      {isSeller && !isPaymentComplete && (
        <>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              margin: 10,
              padding: 8,
              borderRadius: 6,
            }}
            keyboardType="numeric"
            value={depositAmount}
            onChangeText={setDepositAmount}
            placeholder="보증금 금액 입력 (원)"
          />
          <TouchableOpacity
            onPress={async () => {
              if (!depositAmount) {
                Alert.alert('입력 오류', '보증금 금액을 입력해주세요.');
                return;
              }

              await sendMessage(
                roomId,
                userId,
                `보증금 결제 요청: ${depositAmount}원`,
                'depositRequest',
                parseInt(depositAmount)
              );
              Alert.alert('알림', '보증금 결제 요청을 전송했습니다.');
              setDepositAmount('');
            }}
            style={{ backgroundColor: '#FF7F50', padding: 10, margin: 10, borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>보증금 결제 요청</Text>
          </TouchableOpacity>
        </>
      )}

      {!isSeller && (() => {
        const depositMsg = messages.find(m => m.type === 'depositRequest' && m.amount);
        if (!depositMsg || isPaymentComplete) return null;

        return (
          <TouchableOpacity
            onPress={async () => {
              try {
                const res = await axios.post(`${API_URL}/api/deposit/create-intent`, {
                  userId,
                  rentalItemId,
                  amount: parseInt(depositMsg.amount),
                });
                const { clientSecret } = res.data;
                navigation.navigate('StripeCheckoutScreen', { clientSecret });
              } catch (err) {
                console.error('결제 요청 실패:', err.response?.data || err.message);
                Alert.alert('오류', '보증금 결제를 시작할 수 없습니다.');
              }
            }}
            style={{ backgroundColor: '#1E90FF', padding: 10, margin: 10, borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              보증금 {depositMsg.amount}원 결제하기
            </Text>
          </TouchableOpacity>
        );
      })()}

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
  row: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4 },
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
