import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Footer from './Footer';

const API_URL_NODEJS = 'http://192.168.0.6:3000';  // Node.js 서버 URL
const API_URL_FLASK = 'http://192.168.0.6:8083';  // Flask 서버 URL

export default function ReviewList() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route?.params || {};
  const userId = params.userId || '';
  const type = params.type || 'received';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);
  const [sortType, setSortType] = useState('latest');

  // 리뷰 내용에 대한 감정 분석을 요청하는 함수
  const fetchSentiment = async (content) => {
    try {
      const res = await fetch(`${API_URL_FLASK}/predict`, {  // Flask 서버의 /predict 엔드포인트로 요청
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),  // 리뷰 내용 텍스트를 서버로 전송
      });
      const json = await res.json();
      return json.label;  // 반환된 감정 분석 결과(positive, negative, neutral)
    } catch (err) {
      console.error('감정 분석 실패:', err);
      return 'neutral';  // 오류 발생 시 기본값 'neutral'
    }
  };

  // 리뷰 데이터 가져오기
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL_NODEJS}/api/reviews/${type}/${userId}`);
      const json = await res.json();
      const reviewsWithSentiment = await Promise.all(
        json.reviews.map(async (review) => {
          const sentiment = await fetchSentiment(review.content);
          return { ...review, sentiment };  // 리뷰에 감정 분석 결과 추가
        })
      );
      setReviews(reviewsWithSentiment);
    } catch (err) {
      console.error('리뷰 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 평균 별점 가져오기
  const fetchAverage = async () => {
    try {
      const res = await fetch(`${API_URL_NODEJS}/api/reviews/average/${userId}`);
      const json = await res.json();
      setAverageRating(json.average);
      setReviewCount(json.count);
    } catch (err) {
      console.error('평균 별점 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchReviews();
    fetchAverage();
  }, []);

  // 감정 분석에 따른 스타일
  const sentimentStyles = {
    positive: { color: 'green' },  // 긍정은 초록색
    negative: { color: 'red' },    // 부정은 빨간색
    neutral: { color: 'gray' },    // 중립은 회색
  };

  const renderItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <Text style={styles.nickname}>👤 작성자: {item.reviewerProfile?.nickname || item.reviewerId}</Text>
      <Text style={styles.rating}>⭐ 별점: {item.rating}점</Text>
      <Text style={styles.rentalItemName}>🧥 아이템: {item.rentalItemName || item.rentalItemId}</Text>
      <Text style={styles.content}>📝 {item.content || '(내용 없음)'}</Text>
      {item.summary && <Text style={styles.summary}>📌 {item.summary}</Text>}
      <View style={styles.tags}>
        {Array.isArray(item.tags) && item.tags.map((tag) => (
          <Text key={tag} style={styles.tag}>{tag}</Text>
        ))}
      </View>
      <Text style={styles.date}>{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString() : ''}</Text>

      {/* 감정 분석 결과 */}
      {item.sentiment && (
        <Text style={[styles.sentiment, sentimentStyles[item.sentiment]]}>
          감정 분석: 
          {item.sentiment === 'positive' ? '👍 긍정' : 
           item.sentiment === 'negative' ? '👎 부정' : '😐 중립'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{type === 'received' ? '받은 리뷰' : '작성한 리뷰'}</Text>

      {averageRating !== null && (
        <Text style={styles.average}>
          ⭐ 평균 별점: {averageRating}점 ({reviewCount}개 리뷰)
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  average: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  nickname: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#444',
  },
  rentalItemName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    marginBottom: 6,
    color: '#444',
  },
  summary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  tag: {
    fontSize: 12,
    color: '#00bcd4',
    marginRight: 8,
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  date: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  sentiment: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    height: 83,
    width: '109%',
  },
});
