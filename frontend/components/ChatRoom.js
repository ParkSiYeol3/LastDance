// ChatRoom.js
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
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
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
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const isPaymentComplete = ['created', 'succeeded', 'paid'].includes(paymentStatus);

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
        setBuyerId(room.buyerId);

        const map = {};
        if (room.me?.uid) {
          map[room.me.uid] = {
            profileImage:
              typeof room.me.profileImage === 'string'
                ? room.me.profileImage.replace(/^\"|\"$/g, '')
                : null,
            nickname: room.me.nickname || '나',
            uid: room.me.uid,
          };
        }

        if (room.opponent?.uid) {
          map[room.opponent.uid] = {
            profileImage:
              typeof room.opponent.profileImage === 'string'
                ? room.opponent.profileImage.replace(/^\"|\"$/g, '')
                : null,
            nickname: room.opponent.nickname || '상대방',
            uid: room.opponent.uid,
          };
        }

        setParticipants(map);
      } catch (err) {
        console.error('방 프로필 조회 실패:', err.response?.data || err.message);
      }
    })();
  }, [userId, roomId]);

  useEffect(() => {
    const ready =
      typeof isSeller === 'boolean' &&
      rentalItemId &&
      ((isSeller && buyerId) || (!isSeller && userId));

    if (ready) {
      reloadPaymentStatus();
      checkReviewSubmitted();
    }
  }, [isSeller, userId, buyerId, rentalItemId]);

  useFocusEffect(
    useCallback(() => {
      if (
        typeof isSeller === 'boolean' &&
        rentalItemId &&
        ((isSeller && buyerId) || (!isSeller && userId))
      ) {
        checkReviewSubmitted();
      }
    }, [isSeller, buyerId, userId, rentalItemId])
  );

  const reloadPaymentStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/deposit/status`, {
        params: { userId: isSeller ? buyerId : userId, rentalItemId },
      });
      setPaymentStatus(res.data.status);
    } catch (err) {
      console.error('결제 상태 재조회 실패:', err);
    }
  };

  const checkReviewSubmitted = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews/check`, {
        params: { reviewerId: userId, rentalItemId },
      });
      setReviewSubmitted(res.data.exists);
    } catch (err) {
      console.error('리뷰 확인 실패:', err);
    }
  };

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
    const profile = participants[item.senderId] || {
      nickname: '알 수 없음',
      profileImage: null,
    };

    return (
      <View style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}>
        {!isMe && (
          <Image
            source={
              typeof profile.profileImage === 'string' && profile.profileImage.startsWith('http')
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

  const handleNavigateToReview = () => {
    const targetUserId = Object.keys(participants).find(uid => uid !== userId);
    const targetNickname = participants[targetUserId]?.nickname || '상대방';

    navigation.navigate('ReviewForm', {
      targetUserId,
      targetNickname,
      isSeller,
      rentalItemId,
    });
  };

  return (
    <View style={styles.container}>
      {paymentStatus === 'refunded' && !reviewSubmitted && (
        <TouchableOpacity
          style={{ backgroundColor: '#6a5acd', padding: 12, margin: 10, borderRadius: 6 }}
          onPress={handleNavigateToReview}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
            📝 거래 후기 작성하기
          </Text>
        </TouchableOpacity>
      )}

      {paymentStatus !== null && (
  <TouchableOpacity
    disabled
    style={{
      backgroundColor:
        paymentStatus === 'refunded'
          ? '#9ACD32'
          : isPaymentComplete
          ? '#4CAF50'
          : '#FFC107',
      padding: 10,
      margin: 10,
      borderRadius: 8,
    }}
  >
    <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
      {paymentStatus === 'refunded'
        ? '✅ 보증금이 환급되었습니다!'
        : isPaymentComplete
        ? '✅ 보증금 결제 완료!'
        : '⚠️ 보증금 결제가 필요합니다!'}
    </Text>
  </TouchableOpacity>
)}


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