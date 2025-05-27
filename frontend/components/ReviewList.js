import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';


const API_URL = 'http://172.30.1.92:3000';


export default function ReviewList() {
  const route = useRoute();
  const params = route?.params || {};
  const userId = params.userId || '';
  const type = params.type || 'received';




  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);
  const [sortType, setSortType] = useState('latest');

  const fetchReviews = async () => {
    try {
      if (!userId || !type) return;
      const res = await fetch(`${API_URL}/api/reviews/${type}/${userId}`);
      const json = await res.json();
      console.log('📦 받아온 전체 응답:', json);
      setReviews(Array.isArray(json.reviews) ? json.reviews : []);
    } catch (err) {
      console.error('리뷰 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverage = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/average/${userId}`);
      const json = await res.json();
      setAverageRating(json.average);
      setReviewCount(json.count);
    } catch (err) {
      console.error('평균 별점 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    if (type === 'received') fetchAverage();
  }, []);

  const getSortedReviews = () => {
    if (!Array.isArray(reviews)) return [];
    if (sortType === 'rating') {
      return [...reviews].sort((a, b) => b.rating - a.rating);
    } else {
      return [...reviews].sort((a, b) => {
        const aTime = a.createdAt?.seconds
          ? new Date(a.createdAt.seconds * 1000)
          : new Date(a.createdAt);
        const bTime = b.createdAt?.seconds
          ? new Date(b.createdAt.seconds * 1000)
          : new Date(b.createdAt);
        return bTime - aTime;
      });
    }
  };

const renderItem = ({ item }) => (
  <View style={styles.reviewCard}>
    {/* 👤 닉네임 표시 */}
    <Text style={styles.nickname}>
      👤 작성자: {item.reviewerProfile?.nickname || item.reviewerId}
    </Text>

    {/* ⭐ 별점 */}
    <Text style={styles.rating}>⭐ 별점: {item.rating}점</Text>

    {/* 🧥 상품 이름 */}
    <Text style={styles.rentalItemName}>
      🧥 아이템: {item.rentalItemName || item.rentalItemId}
    </Text>

    {/* 📝 내용 */}
    <Text style={styles.content}>
      📝 {item.content || '(내용 없음)'}
    </Text>

    {/* 📌 요약 */}
    {item.summary && (
      <Text style={styles.summary}>📌 {item.summary}</Text>
    )}

    {/* 🏷️ 태그 */}
    <View style={styles.tags}>
      {Array.isArray(item.tags) &&
        item.tags.map((tag) => (
          <Text key={tag} style={styles.tag}>{tag}</Text>
        ))}
    </View>

    {/* 📅 작성일 */}
    <Text style={styles.date}>
      {item.createdAt?.seconds
        ? new Date(item.createdAt.seconds * 1000).toLocaleString()
        : ''}
    </Text>
  </View>
);


  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === 'received' ? '받은 리뷰' : '작성한 리뷰'}
      </Text>

      {type === 'received' && averageRating !== null && (
        <Text style={styles.average}>
          🌟 평균 별점: {averageRating}점 ({reviewCount}개 리뷰)
        </Text>
      )}

      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortButton, sortType === 'latest' && styles.sortSelected]}
          onPress={() => setSortType('latest')}
        >
          <Text style={styles.sortText}>최신순</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortType === 'rating' && styles.sortSelected]}
          onPress={() => setSortType('rating')}
        >
          <Text style={styles.sortText}>별점순</Text>
        </TouchableOpacity>
      </View>

      {!reviews?.length && (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
          작성된 리뷰가 없습니다.
        </Text>
      )}

      <FlatList
        data={getSortedReviews()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  average: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  sortSelected: {
    backgroundColor: '#00bcd4',
    borderColor: '#00bcd4',
  },
  sortText: {
    color: '#000',
    fontWeight: '500',
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
});
