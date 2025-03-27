// PostItem.js
import React, { useState } from 'react';
import { View, TextInput, Button, Image, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from './firebase'; // firebase 설정 파일 import

const PostItem = () => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');
	const [category, setCategory] = useState('');
	const [region, setRegion] = useState('');
	const [images, setImages] = useState([]);
	const [error, setError] = useState('');

	const storage = getStorage();
	const db = getFirestore();

	const handleImageSelect = () => {
		launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
			if (response.didCancel) return;
			setImages(response.assets);
		});
	};

	const handlePostSubmit = async () => {
		try {
			if (images.length === 0) {
				setError('상품 이미지를 추가해 주세요.');
				return;
			}

			// 이미지 업로드 후 URL 받기
			const imageUrls = [];
			for (const image of images) {
				const imageRef = ref(storage, `images/${image.fileName}`);
				const uploadResult = await uploadBytes(imageRef, image.uri);
				const imageUrl = await getDownloadURL(uploadResult.ref);
				imageUrls.push(imageUrl);
			}

			// Firestore에 게시물 데이터 추가
			await addDoc(collection(db, 'posts'), {
				title,
				description,
				price,
				category,
				region,
				images: imageUrls,
				userId: auth.currentUser.uid,
				createdAt: new Date(),
			});

			// 폼 초기화
			setTitle('');
			setDescription('');
			setPrice('');
			setCategory('');
			setRegion('');
			setImages([]);
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<View>
			<Text>게시물 등록</Text>
			<TextInput placeholder='제목' value={title} onChangeText={setTitle} />
			<TextInput placeholder='설명' value={description} onChangeText={setDescription} />
			<TextInput placeholder='가격' value={price} onChangeText={setPrice} keyboardType='numeric' />
			<TextInput placeholder='카테고리' value={category} onChangeText={setCategory} />
			<TextInput placeholder='지역' value={region} onChangeText={setRegion} />

			<Button title='이미지 선택' onPress={handleImageSelect} />
			{images.length > 0 && (
				<View>
					{images.map((image, index) => (
						<Image key={index} source={{ uri: image.uri }} style={{ width: 100, height: 100 }} />
					))}
				</View>
			)}

			<Button title='게시물 등록' onPress={handlePostSubmit} />
			{error && <Text>{error}</Text>}
		</View>
	);
};

export default PostItem;
