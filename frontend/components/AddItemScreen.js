import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

const AddItemScreen = ({ navigation }) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [imageInput, setImageInput] = useState('');
	const [imageURLs, setImageURLs] = useState([]); // ✅ 여러 장 저장용
	const [uploading, setUploading] = useState(false);

	const handleTakePhoto = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 0.7,
			base64: false,
		});

		if (!result.canceled && result.assets.length > 0) {
			setImageURLs((prev) => [...prev, result.assets[0].uri]);
		}
	};

	const handleAddImageURL = () => {
		if (imageInput.trim()) {
			setImageURLs((prev) => [...prev, imageInput.trim()]);
			setImageInput('');
		}
	};

	const handleSubmit = async () => {
		if (!name || !description || imageURLs.length === 0) {
			Alert.alert('오류', '상품명, 설명, 이미지 최소 1장은 필수입니다.');
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
				imageURLs, // ✅ 여러 이미지 저장
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

			{/* 이미지 URL 수동 추가 */}
			<View style={{ flexDirection: 'row', width: '100%', marginBottom: 10 }}>
				<TextInput placeholder='이미지 주소(URL)' style={[styles.input, { flex: 1 }]} value={imageInput} onChangeText={setImageInput} />
				<TouchableOpacity style={styles.addBtn} onPress={handleAddImageURL}>
					<Text style={{ color: '#fff' }}>+ 추가</Text>
				</TouchableOpacity>
			</View>

			{/* 카메라 촬영 */}
			<TouchableOpacity style={styles.cameraBtn} onPress={handleTakePhoto}>
				<Text style={{ color: '#fff', textAlign: 'center' }}>📷 카메라로 촬영하기</Text>
			</TouchableOpacity>

			{/* 이미지 미리보기 */}
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				{imageURLs.map((url, index) => (
					<Image key={index} source={{ uri: url }} style={styles.image} />
				))}
			</ScrollView>

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
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
	},
	textarea: {
		height: 100,
		textAlignVertical: 'top',
		width: '100%',
	},
	cameraBtn: {
		backgroundColor: '#31C585',
		padding: 12,
		borderRadius: 6,
		marginBottom: 10,
		width: '100%',
	},
	addBtn: {
		backgroundColor: '#555',
		justifyContent: 'center',
		paddingHorizontal: 12,
		borderRadius: 5,
		marginLeft: 5,
	},
	image: {
		width: 120,
		height: 120,
		borderRadius: 8,
		marginRight: 10,
	},
});
