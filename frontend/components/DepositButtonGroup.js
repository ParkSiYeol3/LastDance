// components/DepositButtonGroup.js
import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../firebase-config';

const DepositButtonGroup = ({ rental, currentUser }) => {
	const isOwner = currentUser?.uid === rental.ownerId;
	const isDeposited = rental.depositPaid;
	const isRefunded = rental.depositRefunded;

	const handleRequestDeposit = async () => {
		try {
			await axios.post(`${API_URL}/api/deposit/request`, {
				rentalId: rental.id,
				amount: 10000, // 예시 금액
			});
			Alert.alert('보증금 요청 완료');
		} catch (err) {
			Alert.alert('요청 실패', err.message);
		}
	};

	const handlePayDeposit = async () => {
		try {
			const res = await axios.post(`${API_URL}/api/deposit/pay`, {
				rentalId: rental.id,
				userId: currentUser.uid,
			});
			// 리다이렉션 URL 또는 결제 성공 여부 응답 처리
			Alert.alert('결제 요청 성공');
		} catch (err) {
			Alert.alert('결제 실패', err.message);
		}
	};

	const handleRefundDeposit = async () => {
		try {
			await axios.post(`${API_URL}/api/deposit/refund`, {
				rentalId: rental.id,
				userId: rental.requesterId,
			});
			Alert.alert('보증금 환불 완료');
		} catch (err) {
			Alert.alert('환불 실패', err.message);
		}
	};

	if (isOwner && !isDeposited) {
		return (
			<View style={styles.buttonContainer}>
				<Button title='보증금 요청하기' onPress={handleRequestDeposit} />
			</View>
		);
	}

	if (!isOwner && !isDeposited && rental.depositAmount > 0) {
		return (
			<View style={styles.buttonContainer}>
				<Button title='보증금 결제하기' onPress={handlePayDeposit} />
			</View>
		);
	}

	if (isOwner && isDeposited && !isRefunded) {
		return (
			<View style={styles.buttonContainer}>
				<Button title='보증금 환급하기' onPress={handleRefundDeposit} color='green' />
			</View>
		);
	}

	return null;
};

export default DepositButtonGroup;

const styles = StyleSheet.create({
	buttonContainer: {
		marginVertical: 10,
		paddingHorizontal: 20,
	},
});
