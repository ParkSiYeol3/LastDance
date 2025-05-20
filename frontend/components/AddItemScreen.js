// screens/AddItemScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config'; // Firebase 설정에서 export 되어야 함

const AddItemScreen = ({ navigation }) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [imageURL, setImageURL] = useState('');
	const [uploading, setUploading] = useState(false);

	const handleSubmit = async () => {
		if (!name || !description) {
			Alert.alert('오류', '상품명과 설명을 입력해주세요.');
			return;
		}

		setUploading(true);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('위치 권한 필요', '위치 권한을 허용해야 등록할 수 있습니다.');
				return;
			}

			const location = await Location.getCurrentPositionAsync({});
			const user = auth.currentUser;

			await addDoc(collection(db, 'items'), {
				userId: user.uid,
				name,
				description,
				imageURL,
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				timestamp: serverTimestamp(),
			});

			Alert.alert('등록 완료', '상품이 성공적으로 등록되었습니다.');
			navigation.goBack();
		} catch (err) {
			console.error('상품 등록 실패:', err);
			Alert.alert('오류', '상품 등록에 실패했습니다.');
		} finally {
			setUploading(false);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>상품 등록</Text>
			<TextInput placeholder='상품명' style={styles.input} value={name} onChangeText={setName} />
			<TextInput placeholder='설명' style={[styles.input, styles.textarea]} multiline value={description} onChangeText={setDescription} />
			<TextInput placeholder='이미지 주소(URL)' style={styles.input} value={imageURL} onChangeText={setImageURL} />
			{imageURL ? <Image source={{ uri: imageURL }} style={styles.image} /> : null}
			<Button title={uploading ? '등록 중...' : '등록하기'} onPress={handleSubmit} disabled={uploading} />
		</ScrollView>
	);
};

export default AddItemScreen;

const styles = StyleSheet.create({
	container: {
		padding: 20,
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 22,
		marginBottom: 20,
		fontWeight: 'bold',
	},
	input: {
		width: '100%',
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
	},
	textarea: {
		height: 100,
		textAlignVertical: 'top',
	},
	image: {
		width: 200,
		height: 200,
		marginTop: 10,
		marginBottom: 15,
		borderRadius: 10,
	},
});
