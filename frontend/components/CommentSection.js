import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../firebase-config';
import { formatTimestamp } from '../utils/formatTimestamp'; // 경로는 프로젝트에 따라 조정

const CommentSection = ({ itemId, currentUser }) => {
	const [comments, setComments] = useState([]);
	const [commentText, setCommentText] = useState('');

	useEffect(() => {
		loadComments();
	}, []);

	const loadComments = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/items/${itemId}/comments`);
			setComments(res.data.comments);
		} catch (err) {
			console.error('댓글 로딩 실패:', err);
			Alert.alert('오류', '댓글을 불러오지 못했습니다.');
		}
	};

	const handleSubmit = async () => {
		if (!commentText.trim()) return;

		try {
			const token = await AsyncStorage.getItem('accessToken');
			await axios.post(
				`${API_URL}/api/items/${itemId}/comments`,
				{
					userId: currentUser.uid,
					text: commentText,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setCommentText('');
			loadComments();
		} catch (err) {
			console.error('댓글 작성 실패:', err);
			Alert.alert('오류', '댓글 작성에 실패했습니다.');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.header}>💬 댓글</Text>
			<FlatList
				data={comments}
				scrollEnabled={false}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.comment}>
						<Text style={styles.commentText}>
							{item.nickname || item.userId} ({formatTimestamp(item.timestamp)}) : {item.text}
						</Text>
					</View>
				)}
			/>
			{currentUser && (
				<View style={styles.inputContainer}>
					<TextInput style={styles.input} value={commentText} onChangeText={setCommentText} placeholder='댓글을 입력하세요' />
					<Button title='작성' onPress={handleSubmit} />
				</View>
			)}
		</View>
	);
};

export default CommentSection;

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingHorizontal: 20,
		marginTop: 30,
	},
	header: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	comment: {
		paddingVertical: 4,
	},
	commentText: {
		fontSize: 14,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		padding: 8,
		marginRight: 10,
	},
});
