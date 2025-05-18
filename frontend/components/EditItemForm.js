import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../firebase-config';

const EditItemForm = ({ item, onCancel, onSuccess }) => {
	const [name, setName] = useState(item.name);
	const [description, setDescription] = useState(item.description);
	const [imageURL, setImageURL] = useState(item.imageURL || '');

	const handleSubmit = async () => {
		try {
			const token = await AsyncStorage.getItem('accessToken');
			await axios.put(
				`${API_URL}/api/items/${item.id}`,
				{
					name,
					description,
					imageURL,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			Alert.alert('완료', '상품이 수정되었습니다.');
			onSuccess(); // 수정 성공 시 상위에서 다시 불러오도록
		} catch (err) {
			console.error('수정 실패:', err);
			Alert.alert('오류', '상품 수정 실패');
		}
	};

	return (
		<View style={styles.form}>
			<TextInput style={styles.input} value={name} onChangeText={setName} placeholder='상품명' />
			<TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder='설명' multiline />
			<TextInput style={styles.input} value={imageURL} onChangeText={setImageURL} placeholder='이미지 URL' />
			<Button title='저장' onPress={handleSubmit} />
			<Button title='취소' onPress={onCancel} color='gray' />
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
});
