import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase-config';
import { doc, setDoc } from 'firebase/firestore';

export const registerPushToken = async (userId) => {
	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		alert('알림 권한이 거부되었습니다.');
		return;
	}

	const tokenData = await Notifications.getExpoPushTokenAsync();
	const token = tokenData.data;

	console.log('✅ 발급된 FCM 토큰:', token);

	await setDoc(
		doc(db, 'users', userId),
		{
			fcmToken: token,
		},
		{ merge: true }
	);
};
