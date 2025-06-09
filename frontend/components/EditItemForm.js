import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Image, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../firebase-config';

const CLOUD_NAME = 'daqpozmek';
const UPLOAD_PRESET = 'Lastdance';

const EditItemForm = ({ item, onCancel, onSuccess }) => {
	const [name, setName] = useState(item.name);
	const [description, setDescription] = useState(item.description);
	const [imageList, setImageList] = useState(item.imageURLs || []);
	const [loading, setLoading] = useState(false);

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			quality: 0.8,
		});
		if (!result.canceled) {
			const selected = result.assets.map((a) => a.uri);
			setImageList((prev) => [...prev, ...selected]);
		}
	};

	const takePhoto = async () => {
		const result = await ImagePicker.launchCameraAsync({
			quality: 0.8,
		});
		if (!result.canceled) {
			setImageList((prev) => [...prev, result.assets[0].uri]);
		}
	};

	const removeImage = (index) => {
		const newList = [...imageList];
		newList.splice(index, 1);
		setImageList(newList);
	};

	const uploadToCloudinary = async (uri) => {
		const data = new FormData();
		data.append('file', {
			uri,
			type: 'image/jpeg',
			name: 'upload.jpg',
		});
		data.append('upload_preset', UPLOAD_PRESET);
		data.append('cloud_name', CLOUD_NAME);

		const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
			method: 'POST',
			body: data,
		});
		const result = await res.json();

		return result.secure_url;
	};

	const handleSubmit = async () => {
		if (!name.trim()) return Alert.alert('입력 오류', '상품명을 입력하세요.');
		if (imageList.length === 0) return Alert.alert('입력 오류', '최소 1장의 이미지를 등록하세요.');

		try {
			setLoading(true);
			const token = await AsyncStorage.getItem('accessToken');

			const uploadedURLs = [];
			for (const uri of imageList) {
				if (uri.startsWith('http')) {
					uploadedURLs.push(uri); // 이미 업로드된 URL
				} else {
					const uploadedUrl = await uploadToCloudinary(uri);
					uploadedURLs.push(uploadedUrl);
				}
			}
			console.log('👉 저장될 이미지들:', uploadedURLs);

			await axios.put(
				`${API_URL}/api/items/${item.id}`,
				{
					name,
					description,
					imageURLs: uploadedURLs,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			Alert.alert('완료', '상품이 수정되었습니다.');
			onSuccess();
		} catch (err) {
			console.error('수정 실패:', err);
			Alert.alert('오류', '상품 수정 실패');
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.form}>
			<TextInput style={styles.input} value={name} onChangeText={setName} placeholder='상품명' />
			<TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder='설명' multiline />

			<Text style={styles.label}>이미지 미리보기</Text>
			<ScrollView horizontal>
				{imageList.map((uri, idx) => (
					<View key={idx} style={styles.imageBox}>
						<Image source={{ uri }} style={styles.image} />
						<TouchableOpacity style={styles.deleteButton} onPress={() => removeImage(idx)}>
							<Text style={styles.deleteText}>X</Text>
						</TouchableOpacity>
					</View>
				))}
			</ScrollView>

			<View style={styles.buttonRow}>
				<Button title='📁 갤러리' onPress={pickImage} />
				<Button title='📷 촬영' onPress={takePhoto} />
			</View>

			{loading ? (
				<ActivityIndicator size='large' color='#31c585' style={{ marginVertical: 12 }} />
			) : (
				<>
					<Button title='저장' onPress={handleSubmit} />
					<Button title='취소' onPress={onCancel} color='gray' />
				</>
			)}
		</View>
	);
};

export default EditItemForm;

const styles = StyleSheet.create({
	form: {
		width: '100%',
		padding: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		borderRadius: 5,
		marginBottom: 15,
	},
	label: {
		marginBottom: 8,
		fontWeight: 'bold',
	},
	imageBox: {
		marginRight: 10,
		position: 'relative',
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 8,
	},
	deleteButton: {
		position: 'absolute',
		top: 2,
		right: 2,
		backgroundColor: '#000a',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
	},
	deleteText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
});
