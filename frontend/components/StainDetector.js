// components/StainDetector.js
import React, { useState } from 'react';
import { View, Button, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const StainDetector = () => {
	const [imageUri, setImageUri] = useState(null);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	const pickImageAndSend = async () => {
		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: false,
			quality: 0.8,
		});

		if (!result.canceled && result.assets.length > 0) {
			const uri = result.assets[0].uri;
			setImageUri(uri);
			await sendToServer(uri);
		}
	};

	const sendToServer = async (uri) => {
		setLoading(true);
		const formData = new FormData();
		formData.append('image', {
			uri: uri, // ✅ 여기 주의!
			type: 'image/jpeg',
			name: 'photo.jpg',
		});

		try {
			const response = await fetch('http://192.168.0.24:8082/predict', {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				body: formData,
			});

			if (!response.ok) {
				const errText = await response.text();
				console.error('서버 응답 오류:', errText);
				throw new Error('서버 응답 오류');
			}

			const data = await response.json();
			console.log('예측 결과:', data);
			setResult(data.predictions);
		} catch (error) {
			console.error('❌ Flask 서버 호출 실패:', error.message);
			setResult([{ error: '서버 오류: ' + error.message }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Button title='📷 얼룩 감지 시작' onPress={pickImageAndSend} />
			{loading && <ActivityIndicator size='large' style={{ marginTop: 20 }} />}
			{imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
			{result && (
				<Text style={styles.resultText}>
					결과: {'\n'}
					{JSON.stringify(result, null, 2)}
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
	image: { width: 300, height: 300, marginVertical: 20 },
	resultText: { fontSize: 14, color: '#333' },
});

export default StainDetector;
