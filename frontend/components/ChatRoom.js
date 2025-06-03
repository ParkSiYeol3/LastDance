// ChatRoom.js

import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Image, StyleSheet, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useStripe } from '@stripe/stripe-react-native';
import { fetchMessages, sendMessage, markMessageAsRead } from '../components/ChatService';
import { API_URL } from '../firebase-config';

const ChatRoom = ({ route, navigation }) => {
	const { roomId } = route.params;
	const { initPaymentSheet, presentPaymentSheet } = useStripe();

	const [userId, setUserId] = useState(null);
	const [participants, setParticipants] = useState({});
	const [messages, setMessages] = useState([]);
	const [inputText, setInputText] = useState('');
	const [isSeller, setIsSeller] = useState(false);
	const [rentalItemId, setRentalItemId] = useState(null);
	const [depositAmount, setDepositAmount] = useState('');
	const [paymentStatus, setPaymentStatus] = useState(null);

	const [sellerId, setSellerId] = useState(null);
	const [buyerId, setBuyerId] = useState(null);

	const [hasWrittenReview, setHasWrittenReview] = useState(false);
	const [tradeEnded, setTradeEnded] = useState(false);

	const isPaymentComplete = ['created', 'succeeded', 'paid'].includes(paymentStatus);

	// 1) AsyncStorage에서 tradeEnded 복원
	useEffect(() => {
		(async () => {
			try {
				const stored = await AsyncStorage.getItem(`tradeEnded-${roomId}`);
				if (stored === 'true') {
					setTradeEnded(true);
				}
			} catch (e) {
				console.error('AsyncStorage에서 tradeEnded 복원 실패:', e);
			}
		})();
	}, [roomId]);

	// 2) 사용자 ID 가져오기
	useEffect(() => {
		AsyncStorage.getItem('userId')
			.then((uid) => {
				if (!uid) Alert.alert('알림', '로그인 후 이용해주세요.');
				else setUserId(uid);
			})
			.catch(console.error);
	}, []);

	// 3) 채팅방 프로필 가져오기
	useEffect(() => {
		if (!userId || !roomId) return;
		(async () => {
			try {
				const token = await AsyncStorage.getItem('accessToken');
				const res = await axios.get(`${API_URL}/api/chat/rooms/with-profile`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const room = res.data.rooms.find((r) => r.id === roomId);
				if (!room) return;

				setIsSeller(room.sellerId === userId);
				setRentalItemId(room.rentalItemId);
				setBuyerId(room.buyerId);
				setSellerId(room.sellerId);

				const map = {};
				map[userId] = { profileImage: null };
				map[room.opponent.uid] = {
					profileImage: room.opponent.profileImage?.replace(/^"(.*)"$/, '$1') || null,
				};
				setParticipants(map);
			} catch (err) {
				console.error('방 프로필 조회 실패:', err);
			}
		})();
	}, [userId, roomId]);

	// 4) 결제 상태 및 후기 작성 여부 조회
	useEffect(() => {
		if ((isSeller && buyerId && rentalItemId) || (!isSeller && userId && rentalItemId)) {
			reloadPaymentStatus();
			checkWrittenReview();
		}
	}, [isSeller, userId, buyerId, rentalItemId]);

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

	const checkWrittenReview = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/reviews/check`, {
				params: { reviewerId: userId, rentalItemId },
			});
			setHasWrittenReview(res.data.exists);
		} catch (error) {
			console.error('후기 작성 여부 확인 실패:', error);
			setHasWrittenReview(false);
		}
	};

	// 5) 메시지 로드 & 실시간 업데이트
	useEffect(() => {
		if (!userId || !roomId) return;
		const loadMessages = async () => {
			try {
				const msgs = await fetchMessages(roomId);
				setMessages(msgs);
			} catch (err) {
				console.error('메시지 로드 실패:', err);
			}
		};
		loadMessages();
		const iv = setInterval(loadMessages, 2000);
		return () => clearInterval(iv);
	}, [userId, roomId]);

	// 6) 결제 상태 폴링
	useEffect(() => {
		if (!rentalItemId || !(isSeller ? buyerId : userId)) return;
		const intervalId = setInterval(() => {
			reloadPaymentStatus();
		}, 3000);
		return () => clearInterval(intervalId);
	}, [userId, buyerId, rentalItemId, isSeller]);

	// 7) 메시지 전송
	const onSend = async () => {
		if (!inputText.trim()) return;

		try {
			const token = await AsyncStorage.getItem('accessToken'); // ✅ 토큰 가져오기

			await axios.post(
				`${API_URL}/api/chat/rooms/${roomId}/messages`,
				{
					text: inputText.trim(),
					senderId: userId,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`, // ✅ 헤더에 토큰 포함
					},
				}
			);

			setInputText('');
			const msgs = await fetchMessages(roomId);
			setMessages(msgs);
		} catch (err) {
			console.error('메시지 전송 실패:', err);
			Alert.alert('오류', '메시지 전송에 실패했습니다.');
		}
	};

	// 8) 메시지 읽음 처리
	const onRead = (messageId) => {
		if (!roomId) return;
		markMessageAsRead(roomId, messageId).catch(console.error);
	};

	// 9) 거래 종료 → 보증금 환급 호출 + AsyncStorage에 저장 후 상태 변경
	const onEndTrade = async () => {
		try {
			await axios.post(`${API_URL}/api/deposit/auto-refund`, {
				userId: buyerId,
				rentalItemId,
			});
			setPaymentStatus('refunded');
			setTradeEnded(true);
			await AsyncStorage.setItem(`tradeEnded-${roomId}`, 'true');
			Alert.alert('거래 종료', '거래가 종료되어 보증금이 환급되었습니다. 후기 작성이 가능합니다.');
		} catch (e) {
			console.error('보증금 환급 실패:', e);
			Alert.alert('오류', '보증금 환급에 실패했습니다. 잠시 후 다시 시도해주세요.');
		}
	};

	// 10) 메시지 렌더링
	const renderItem = ({ item }) => {
		const isMe = item.senderId === userId;
		const profile = participants[item.senderId] || {};

		return (
			<View style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}>
				{!isMe && <Image source={profile.profileImage ? { uri: profile.profileImage } : require('../assets/profile.png')} style={styles.avatar} />}
				<TouchableOpacity onPress={() => onRead(item.id)} style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
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

	// 11) 결제 처리 함수 (모달식 PaymentSheet)
	const handlePayment = async (amount) => {
		try {
			await AsyncStorage.setItem('currentRentalItemId', rentalItemId);
			const res = await axios.post(`${API_URL}/api/deposit/create-intent`, {
				userId,
				rentalItemId,
				amount,
			});
			const { clientSecret } = res.data;

			const { error: initError } = await initPaymentSheet({
				paymentIntentClientSecret: clientSecret,
				merchantDisplayName: '이거옷대여',
			});
			if (initError) {
				console.error('PaymentSheet 초기화 오류:', initError);
				Alert.alert('오류', '결제 초기화 실패');
				return;
			}

			const { error: presentError, paymentIntent } = await presentPaymentSheet();
			if (presentError) {
				Alert.alert('결제 실패', presentError.message);
			} else if (paymentIntent) {
				Alert.alert('결제 성공!', '보증금 결제가 완료되었습니다.');
				try {
					const userIdStored = await AsyncStorage.getItem('userId');
					const rentalIdStored = await AsyncStorage.getItem('currentRentalItemId');
					await axios.post(`${API_URL}/api/deposit/confirm-payment`, {
						paymentIntentId: paymentIntent.id,
						userId: userIdStored,
						rentalItemId: rentalIdStored,
					});
				} catch (err) {
					console.error('결제 상태 업데이트 실패:', err);
					Alert.alert('오류', '결제 성공 후 상태 업데이트에 실패했습니다.');
				}
			}
		} catch (err) {
			console.error('결제 요청/처리 오류:', err);
			Alert.alert('오류', '결제 시도 중 문제가 발생했습니다.');
		}
	};

	// ===========================
	// 신고 버튼 눌렀을 때 ReportScreen으로 이동
	// ===========================
	const onPressReport = () => {
		// 신고하는 쪽 ID=userId, 신고 대상=상대방(sellerId 또는 buyerId)
		const targetUserId = isSeller ? buyerId : sellerId;
		navigation.navigate('ReportScreen', {
			targetUserId,
			reporterId: userId,
		});
	};

	return (
		<View style={styles.container}>
			{/* 상단에 신고하기 버튼 */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>채팅방</Text>
				<TouchableOpacity style={styles.reportButton} onPress={onPressReport}>
					<Text style={styles.reportButtonText}>신고하기</Text>
				</TouchableOpacity>
			</View>

			{/* 1) 결제 상태 배너 */}
			{paymentStatus !== null && (
				<View
					style={{
						backgroundColor: paymentStatus === 'refunded' ? '#9ACD32' : isPaymentComplete ? '#4CAF50' : '#FFC107',
						padding: 10,
						margin: 10,
						borderRadius: 8,
					}}
				>
					<Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
						{paymentStatus === 'refunded' ? '✅ 보증금이 환급되었습니다!' : isPaymentComplete ? '✅ 보증금 결제 완료!' : '⚠️ 보증금 결제가 필요합니다!'}
					</Text>
				</View>
			)}

			{/* 2) 판매자: 보증금 요청 UI */}
			{isSeller && paymentStatus === 'none' && (
				<>
					<TextInput style={styles.inputDeposit} keyboardType='numeric' value={depositAmount} onChangeText={setDepositAmount} placeholder='보증금 금액 입력 (원)' />
					<TouchableOpacity
						onPress={async () => {
							if (!depositAmount.trim()) {
								return Alert.alert('입력 오류', '보증금 금액을 입력해주세요.');
							}
							await sendMessage(roomId, userId, `보증금 결제 요청: ${depositAmount}원`, 'depositRequest', parseInt(depositAmount, 10));
							Alert.alert('알림', '보증금 결제 요청을 전송했습니다.');
							setDepositAmount('');
						}}
						style={styles.buttonDepositRequest}
					>
						<Text style={styles.buttonText}>보증금 결제 요청</Text>
					</TouchableOpacity>
				</>
			)}

			{/* 3) 판매자: 거래 종료 버튼 */}
			{isSeller && isPaymentComplete && !tradeEnded && (
				<TouchableOpacity onPress={onEndTrade} style={styles.buttonEndTrade}>
					<Text style={styles.buttonText}>거래 종료</Text>
				</TouchableOpacity>
			)}

			{/* 4) 구매자: 보증금 결제하기 버튼 (모달 형태) */}
			{!isSeller &&
				(() => {
					const depositMsg = messages.find((m) => m.type === 'depositRequest' && m.amount);
					if (!depositMsg) return null;

					if (paymentStatus === 'created' || paymentStatus === 'paid' || paymentStatus === 'refunded') {
						return null;
					}

					return (
						<TouchableOpacity onPress={() => handlePayment(parseInt(depositMsg.amount, 10))} style={styles.buttonPayDeposit}>
							<Text style={styles.buttonText}>보증금 {depositMsg.amount}원 결제하기</Text>
						</TouchableOpacity>
					);
				})()}

			{/* 5) 거래 후기 작성 버튼 */}
			{(tradeEnded || paymentStatus === 'refunded') && !hasWrittenReview && (
				<TouchableOpacity
					style={styles.buttonReview}
					onPress={() => {
						const roleValue = isSeller ? 'seller' : 'buyer';
						const targetUserId = isSeller ? buyerId : sellerId;
						navigation.navigate('ReviewForm', {
							roomId,
							reviewerId: userId,
							targetUserId,
							role: roleValue,
							rentalItemId,
						});
					}}
				>
					<Text style={styles.buttonText}>거래 후기 작성하기</Text>
				</TouchableOpacity>
			)}

			{/* 6) 채팅 메시지 리스트 */}
			<FlatList data={messages} inverted keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ padding: 10 }} keyboardShouldPersistTaps='handled' />

			{/* 7) 메시지 입력창 */}
			<View style={styles.inputContainer}>
				<TextInput style={styles.input} value={inputText} onChangeText={setInputText} placeholder='메시지를 입력하세요' />
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
	// Header 스타일
	header: {
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderColor: '#ddd',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	reportButton: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: '#FF3B30',
		borderRadius: 4,
	},
	reportButtonText: {
		color: '#fff',
		fontWeight: 'bold',
	},

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

	inputDeposit: {
		borderWidth: 1,
		borderColor: '#ccc',
		margin: 10,
		padding: 8,
		borderRadius: 6,
		fontSize: 16,
	},
	buttonDepositRequest: {
		backgroundColor: '#FF7F50',
		padding: 10,
		marginHorizontal: 10,
		borderRadius: 6,
		marginBottom: 12,
	},
	buttonEndTrade: {
		backgroundColor: '#d9534f',
		padding: 10,
		marginHorizontal: 10,
		borderRadius: 6,
		marginBottom: 12,
	},
	buttonPayDeposit: {
		backgroundColor: '#1E90FF',
		padding: 10,
		marginHorizontal: 10,
		borderRadius: 6,
		marginBottom: 12,
	},
	buttonReview: {
		backgroundColor: '#0275d8',
		padding: 10,
		marginHorizontal: 10,
		borderRadius: 6,
		marginBottom: 12,
	},
	buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

	// Modal 스타일 (사실상 더이상 사용되지 않음)
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContainer: {
		width: '80%',
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 20,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 12,
		textAlign: 'center',
	},
	modalLabel: {
		fontSize: 14,
		marginBottom: 6,
	},
	modalInput: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 6,
		padding: 10,
		height: 100,
		textAlignVertical: 'top',
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 12,
	},
	modalButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 4,
		marginLeft: 8,
	},
	cancelButton: {
		backgroundColor: '#aaa',
	},
	submitButton: {
		backgroundColor: '#FF3B30',
	},
	modalButtonText: {
		color: '#fff',
		fontWeight: 'bold',
	},
});
