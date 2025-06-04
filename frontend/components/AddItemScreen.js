import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

const CLOUD_NAME = 'daqpozmek';
const UPLOAD_PRESET = 'Lastdance';
const SERVER_URL = 'http://192.168.0.24:3000'; // ⚠️ 실제 IP 또는 도메인으로 변경

const AddItemScreen = ({ navigation }) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [imageInput, setImageInput] = useState('');
	const [imageList, setImageList] = useState([]); // { url, public_id }
	const [uploading, setUploading] = useState(false);
	const [category, setCategory] = useState('');

	const categoryStyles = {
		상의: { icon: '👕', color: '#31C585' },
		하의: { icon: '👖', color: '#4A90E2' },
		신발: { icon: '👟', color: '#FFA500' },
		가방: { icon: '👜', color: '#9B59B6' },
	};

	const uploadToCloudinary = async (imageUri) => {
		const data = new FormData();
		data.append('file', {
			uri: imageUri,
			type: 'image/jpeg',
			name: 'photo.jpg',
		});
		data.append('upload_preset', UPLOAD_PRESET);

		try {
			const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
				method: 'POST',
				body: data,
			});
			const result = await res.json();
			return { url: result.secure_url, public_id: result.public_id };
		} catch (err) {
			console.error('Cloudinary 업로드 실패:', err);
			return null;
		}
	};

	const handlePickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 0.7,
		});

		if (!result.canceled && result.assets.length > 0) {
			const uri = result.assets[0].uri;
			const uploaded = await uploadToCloudinary(uri);
			if (uploaded) {
				setImageList((prev) => [...prev, uploaded]);
			} else {
				Alert.alert('오류', '이미지 업로드 실패');
			}
		}
	};

	const handleTakePhoto = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 0.7,
		});

		if (!result.canceled && result.assets.length > 0) {
			const uri = result.assets[0].uri;
			const uploaded = await uploadToCloudinary(uri);
			if (uploaded) {
				setImageList((prev) => [...prev, uploaded]);
			} else {
				Alert.alert('오류', '이미지 업로드 실패');
			}
		}
	};

	const handleDeleteImage = async (index) => {
		const target = imageList[index];
		Alert.alert('삭제 확인', '이 이미지를 삭제할까요?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				style: 'destructive',
				onPress: async () => {
					try {
						// 서버에 삭제 요청
						if (target.public_id) {
							await fetch(`${SERVER_URL}/api/cloudinary/delete-image`, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ public_id: target.public_id }),
							});
						}
						setImageList((prev) => prev.filter((_, i) => i !== index));
					} catch (err) {
						console.error('이미지 삭제 오류:', err);
						Alert.alert('오류', '삭제 실패');
					}
				},
			},
		]);
	};

	const handleAddImageURL = () => {
		if (imageInput.trim()) {
			setImageList((prev) => [...prev, { url: imageInput.trim(), public_id: null }]);
			setImageInput('');
		}
	};

	const handleSubmit = async () => {
		if (!name || !description || !category || imageList.length === 0) {
			Alert.alert('필수 입력', '모든 항목과 이미지를 등록해주세요.');
			return;
		}

		setUploading(true);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('위치 권한 필요', '위치 접근 권한이 필요합니다.');
				return;
			}

			const location = await Location.getCurrentPositionAsync({});
			const user = auth.currentUser;

			await addDoc(collection(db, 'items'), {
				userId: user.uid,
				name,
				description,
				category,
				imageURLs: imageList.map((img) => img.url),
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				timestamp: serverTimestamp(),
			});

			Alert.alert('등록 완료', '상품이 등록되었습니다.');
			navigation.goBack();
		} catch (err) {
			console.error('등록 실패:', err);
			Alert.alert('오류', '상품 등록 실패');
		} finally {
			setUploading(false);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>상품 등록</Text>

			<TextInput placeholder='상품명' style={styles.input} value={name} onChangeText={setName} />
			<TextInput placeholder='설명' style={[styles.input, styles.textarea]} value={description} multiline onChangeText={setDescription} />

			<View style={styles.categoryContainer}>
				{Object.keys(categoryStyles).map((cat) => {
					const isSelected = category === cat;
					const { icon, color } = categoryStyles[cat];
					return (
						<TouchableOpacity key={cat} style={[styles.categoryBtn, isSelected && { backgroundColor: color }]} onPress={() => setCategory(cat)}>
							<Text style={[styles.categoryText, isSelected && { color: '#fff', fontWeight: 'bold' }]}>
								{icon} {cat}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			<View style={{ flexDirection: 'row', width: '100%', marginBottom: 10 }}>
				<TextInput placeholder='이미지 URL' style={[styles.input, { flex: 1 }]} value={imageInput} onChangeText={setImageInput} />
				<TouchableOpacity style={styles.addBtn} onPress={handleAddImageURL}>
					<Text style={{ color: '#fff' }}>+ 추가</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity style={styles.cameraBtn} onPress={handleTakePhoto}>
				<Text style={{ color: '#fff', textAlign: 'center' }}>📷 카메라로 촬영하기</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
				<Text style={{ color: '#fff', textAlign: 'center' }}>🖼 갤러리에서 선택하기</Text>
			</TouchableOpacity>

			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				{imageList.map((img, index) => (
					<View key={index} style={{ position: 'relative', marginRight: 10 }}>
						<Image source={{ uri: img.url }} style={styles.image} />
						<TouchableOpacity
							onPress={() => handleDeleteImage(index)}
							style={{
								position: 'absolute',
								top: -6,
								right: -6,
								backgroundColor: 'red',
								borderRadius: 10,
								width: 20,
								height: 20,
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Text style={{ color: 'white', fontSize: 12 }}>X</Text>
						</TouchableOpacity>
					</View>
				))}
			</ScrollView>

			<Button title={uploading ? '등록 중...' : '등록하기'} onPress={handleSubmit} disabled={uploading} />
		</ScrollView>
	);
};

export default AddItemScreen;

const styles = StyleSheet.create({
	container: { padding: 20, backgroundColor: '#fff', alignItems: 'center' },
	title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
	input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 15, width: '100%' },
	textarea: { height: 100, textAlignVertical: 'top' },
	cameraBtn: { backgroundColor: '#31C585', padding: 12, borderRadius: 6, marginBottom: 10, width: '100%' },
	addBtn: { backgroundColor: '#555', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 5, marginLeft: 5 },
	image: { width: 120, height: 120, borderRadius: 8 },
	categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, width: '100%' },
	categoryBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 16, marginRight: 8, marginBottom: 8 },
	categoryText: { color: '#333', fontSize: 14 },
});
