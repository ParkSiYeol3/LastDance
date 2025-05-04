import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableWithoutFeedback } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase-config';
import { doc, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';

const formatTimestamp = (ts) => {
	if (!ts || !ts.seconds) return '';
	const date = new Date(ts.seconds * 1000);
	const year = date.getFullYear();
	const month = `0${date.getMonth() + 1}`.slice(-2);
	const day = `0${date.getDate()}`.slice(-2);
	const hour = `0${date.getHours()}`.slice(-2);
	const minute = `0${date.getMinutes()}`.slice(-2);
	return `${year}-${month}-${day} ${hour}:${minute}`;
};

const ChatRoom = () => {
	const route = useRoute();
	const { chatRoomId } = route.params;
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [editingMessageId, setEditingMessageId] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const flatListRef = useRef();

	useEffect(() => {
		const auth = getAuth();
		setCurrentUser(auth.currentUser);
		if (chatRoomId) {
			const q = query(collection(db, 'chatRooms', chatRoomId, 'messages'), orderBy('timestamp', 'asc'));
			const unsubscribe = onSnapshot(q, (snapshot) => {
				const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				setMessages(msgs);
			});
			return () => unsubscribe();
		}
	}, [chatRoomId]);

	useEffect(() => {
		if (flatListRef.current && messages.length > 0 && isAtBottom) {
			flatListRef.current.scrollToEnd({ animated: true });
		}
	}, [messages, isAtBottom]);

	useEffect(() => {
		const markAsRead = async () => {
			const unreadMessages = messages.filter((msg) => msg.senderId !== currentUser?.uid && !msg.read);
			for (const msg of unreadMessages) {
				const msgRef = doc(db, 'chatRooms', chatRoomId, 'messages', msg.id);
				await updateDoc(msgRef, { read: true });
			}
		};
		if (messages.length > 0) {
			markAsRead();
		}
	}, [messages]);

	const handleScroll = (event) => {
		const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
		const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
		setIsAtBottom(distanceFromBottom < 20);
	};

	const handleSend = async () => {
		if (!newMessage.trim()) return;
		try {
			if (editingMessageId) {
				const msgRef = doc(db, 'chatRooms', chatRoomId, 'messages', editingMessageId);
				await updateDoc(msgRef, { text: newMessage });
				setEditingMessageId(null);
			} else {
				const messageRef = collection(db, 'chatRooms', chatRoomId, 'messages');
				await addDoc(messageRef, {
					text: newMessage,
					senderId: currentUser.uid,
					timestamp: serverTimestamp(),
					read: false,
				});
			}
			setNewMessage('');
		} catch (error) {
			console.error('메시지 전송 오류:', error);
		}
	};

	const handleDeleteMessage = async (messageId) => {
		try {
			const msgRef = doc(db, 'chatRooms', chatRoomId, 'messages', messageId);
			await deleteDoc(msgRef);
		} catch (err) {
			console.error('메시지 삭제 오류:', err);
		}
	};

	const handleLongPress = (item) => {
		if (item.senderId !== currentUser?.uid) return;
		Alert.alert('메시지 옵션', '이 메시지를 어떻게 하시겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '수정',
				onPress: () => {
					setNewMessage(item.text);
					setEditingMessageId(item.id);
				},
			},
			{
				text: '삭제',
				style: 'destructive',
				onPress: () => handleDeleteMessage(item.id),
			},
		]);
	};

	const renderMessage = (item) => {
		const isMe = item.senderId === currentUser?.uid;
		return (
			<TouchableWithoutFeedback onLongPress={() => handleLongPress(item)}>
				<View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
					<Text style={styles.messageText}>{item.text}</Text>
					<Text style={styles.timestamp}>{isMe ? (item.timestamp?.seconds ? (item.read ? '읽음' : '전송됨') : '보내는 중...') : formatTimestamp(item.timestamp)}</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => renderMessage(item)}
				onScroll={handleScroll}
				scrollEventThrottle={100}
				contentContainerStyle={{ padding: 10 }}
			/>
			<View style={styles.inputContainer}>
				<TextInput style={styles.input} value={newMessage} onChangeText={setNewMessage} placeholder='메시지를 입력하세요' />
				<Button title={editingMessageId ? '수정' : '보내기'} onPress={handleSend} />
			</View>
		</KeyboardAvoidingView>
	);
};

export default ChatRoom;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	messageContainer: {
		marginVertical: 4,
		padding: 8,
		borderRadius: 8,
		maxWidth: '80%',
	},
	myMessage: {
		backgroundColor: '#DCF8C6',
		alignSelf: 'flex-end',
	},
	theirMessage: {
		backgroundColor: '#ECECEC',
		alignSelf: 'flex-start',
	},
	messageText: {
		fontSize: 16,
	},
	timestamp: {
		fontSize: 10,
		color: '#888',
		marginTop: 4,
		textAlign: 'right',
	},
	inputContainer: {
		flexDirection: 'row',
		padding: 10,
		borderTopWidth: 1,
		borderColor: '#ddd',
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 20,
		paddingHorizontal: 12,
		marginRight: 10,
	},
});
