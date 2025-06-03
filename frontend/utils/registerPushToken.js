import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase-config';

export async function registerPushToken() {
	try {
		const user = auth.currentUser;
		if (!user) return;

		if (!Device.isDevice) {
			console.warn('푸시 알림은 실제 디바이스에서만 작동합니다.');
			return;
		}

		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== 'granted') {
			console.warn('푸시 알림 권한 거부됨');
			return;
		}

		// ✅ 여기 핵심: projectId를 명시적으로 넘겨줘야 함
		const tokenData = await Notifications.getExpoPushTokenAsync(); // ✅ 인자 없이 호출

		const pushToken = tokenData.data;

		await setDoc(
			doc(db, 'users', user.uid),
			{
				pushToken,
			},
			{ merge: true }
		);

		console.log('✅ FCM 토큰 등록 완료:', pushToken);
	} catch (error) {
		console.error('❌ FCM 토큰 등록 실패:', error);
	}
}
