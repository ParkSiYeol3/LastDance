// ✅ Cloudinary 연동된 최종 AddItemScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Image, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Footer from './Footer';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

const CLOUD_NAME = 'daqpozmek';
const UPLOAD_PRESET = 'Lastdance';
const SERVER_URL = 'http://192.168.1.173:3000';

const AddItemScreen = ({ navigation }) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [imageList, setImageList] = useState([]); // { url, public_id }
	const [uploading, setUploading] = useState(false);
	const [category, setCategory] = useState('');

	const categoryStyles = {
		상의: { icon: '👕', color: '#31C585' },
		가방: { icon: '👜', color: '#9B59B6' },
		하의: { icon: '👖', color: '#4A90E2' },
		신발: { icon: '👟', color: '#FFA500' },
	};

	const requestPermission = async (type) => {
		const { status } = type === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('권한 필요', `${type === 'camera' ? '카메라' : '갤러리'} 접근 권한이 필요합니다.`);
			return false;
		}
		return true;
	};

	const uploadToCloudinary = async (imageUri) => {
		const data = new FormData();
		data.append('file', {
			uri: imageUri,
			type: 'image/jpeg',
			name: 'upload.jpg',
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

	const handleImagePick = async (fromCamera = false) => {
		const ok = await requestPermission(fromCamera ? 'camera' : 'gallery');
		if (!ok) return;

		const result = fromCamera ? await ImagePicker.launchCameraAsync({ quality: 0.7 }) : await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.7 });

		if (!result.canceled) {
			const images = fromCamera ? [result.assets[0]] : result.assets;
			for (const asset of images) {
				const uploaded = await uploadToCloudinary(asset.uri);
				if (uploaded) setImageList((prev) => [...prev, uploaded]);
			}
		}
	};

	const handleRemoveImage = async (index) => {
		const target = imageList[index];
		Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				style: 'destructive',
				onPress: async () => {
					try {
						if (target.public_id) {
							await fetch(`${SERVER_URL}/api/cloudinary/delete-image`, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ public_id: target.public_id }),
							});
						}
						setImageList((prev) => prev.filter((_, i) => i !== index));
					} catch (err) {
						Alert.alert('삭제 실패', '이미지 삭제 중 오류 발생');
					}
				},
			},
		]);
	};

	const handleSubmit = async () => {
		if (!name || !description || !category || imageList.length === 0) {
			Alert.alert('입력 필요', '모든 필드를 채워주세요.');
			return;
		}

		setUploading(true);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('위치 권한 필요', '위치 권한을 허용해주세요.');
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

			Alert.alert('등록 완료', '상품이 성공적으로 등록되었습니다.');
			navigation.goBack();
		} catch (err) {
			Alert.alert('오류 발생', '상품 등록 중 오류가 발생했습니다.');
		} finally {
			setUploading(false);
		}
	};

	return (
		<>
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.header}>상품 등록</Text>

				<TextInput placeholder='상품명' style={styles.input} value={name} onChangeText={setName} />
				<TextInput placeholder='설명' style={[styles.input, styles.textarea]} multiline value={description} onChangeText={setDescription} />

				<View style={styles.categoryContainer}>
					{Object.keys(categoryStyles).map((cat) => {
						const selected = category === cat;
						const { icon, color } = categoryStyles[cat];
						return (
							<TouchableOpacity key={cat} style={[styles.categoryBtn, selected && { backgroundColor: color }]} onPress={() => setCategory(cat)}>
								<Text style={[styles.categoryText, selected && { color: '#fff' }]}>
									{icon} {cat}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				<View style={styles.imageButtonRow}>
					<TouchableOpacity style={styles.galleryBtn} onPress={() => handleImagePick(false)}>
						<Text style={{ color: '#fff' }}>🖼 갤러리 선택</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.cameraBtn} onPress={() => handleImagePick(true)}>
						<Text style={{ color: '#fff' }}>📷 촬영</Text>
					</TouchableOpacity>
				</View>

				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{imageList.map((img, idx) => (
						<View key={idx} style={{ position: 'relative', marginRight: 10 }}>
							<Image source={{ uri: img.url }} style={styles.image} />
							<TouchableOpacity onPress={() => handleRemoveImage(idx)} style={styles.deleteBadge}>
								<Text style={{ color: 'white', fontSize: 12 }}>X</Text>
							</TouchableOpacity>
						</View>
					))}
				</ScrollView>

				<TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={uploading}>
					<Text style={styles.submitText}>{uploading ? '등록 중...' : '상품 등록'}</Text>
				</TouchableOpacity>
			</ScrollView>

			<View style={styles.footer}>
				<Footer navigation={navigation} />
			</View>
		</>
	);
};

export default AddItemScreen;

const styles = StyleSheet.create({
	container: { padding: 20, backgroundColor: '#fff' },
	header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
	textarea: { height: 100, textAlignVertical: 'top' },
	categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
	categoryBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, margin: 5 },
	categoryText: { fontSize: 14, color: '#333' },
	imageButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
	galleryBtn: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' },
	cameraBtn: { backgroundColor: '#111', padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
	image: { width: 100, height: 100, borderRadius: 10 },
	deleteBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
	submitBtn: { backgroundColor: '#31C585', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
	submitText: { color: '#fff', fontWeight: 'bold' },
	footer: { position: 'absolute', bottom: 0, width: '100%', height: 85 },
});
