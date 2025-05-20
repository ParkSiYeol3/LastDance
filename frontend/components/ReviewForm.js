import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../firebase-config'; // ✅ 추가

const StarRating = ({ rating, onChange }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.starContainer}>
      {stars.map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <Text style={[styles.star, rating >= star && styles.filledStar]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function ReviewForm() {
  const { targetUserId, targetNickname, isSeller, rentalItemId } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [reviewerId, setReviewerId] = useState(null);

  const availableTags = isSeller
    ? ['#시간약속', '#신뢰가는대여자', '#깨끗한사용']
    : ['#친절한판매자', '#깔끔한포장', '#빠른응답'];

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setReviewerId).catch(console.error);
  }, []);

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0 || content.trim() === '') {
      Alert.alert('별점과 후기를 모두 작성해주세요.');
      return;
    }

    if (!reviewerId) {
      Alert.alert('사용자 정보가 없습니다.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerId,
          targetUserId,
          role: isSeller ? 'seller' : 'buyer',
          rating,
          summary,
          content,
          tags,
          rentalItemId,
        }),
      });

      if (res.ok) {
        Alert.alert('후기 등록 완료');
      } else {
        const error = await res.text();
        throw new Error(error);
      }
    } catch (err) {
      Alert.alert('후기 등록 중 오류 발생');
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>
        {(targetNickname || '상대방')}님 ({isSeller ? '대여자' : '판매자'})에게 후기 남기기
      </Text>

      <StarRating rating={rating} onChange={setRating} />

      <TextInput
        style={styles.input}
        placeholder="한 줄 요약"
        value={summary}
        onChangeText={setSummary}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="상세한 후기를 작성해주세요"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <View style={styles.tagContainer}>
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, tags.includes(tag) && styles.tagSelected]}
            onPress={() => toggleTag(tag)}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>후기 작성 완료</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  starContainer: { flexDirection: 'row', marginBottom: 16 },
  star: { fontSize: 32, color: '#ccc', marginRight: 8 },
  filledStar: { color: '#FFD700' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  tag: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagSelected: { backgroundColor: '#e0f7fa', borderColor: '#00bcd4' },
  tagText: { fontSize: 14 },
  button: {
    backgroundColor: '#00bcd4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
