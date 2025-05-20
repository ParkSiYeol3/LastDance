import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';

const API_URL = 'http://192.168.0.6:3000';

export default function ReviewList({ route }) {
  const { userId, type } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);
  const [sortType, setSortType] = useState('latest'); // 'latest' or 'rating'

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${type}/${userId}`);
      const json = await res.json();
      setReviews(json.reviews);
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

  // 🔁 정렬된 리뷰 리스트 반환
  const getSortedReviews = () => {
    if (sortType === 'rating') {
      return [...reviews].sort((a, b) => b.rating - a.rating);
    } else {
      return [...reviews].sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime - aTime;
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.profileRow}>
        {item.reviewerProfile?.profileImage ? (
          <Image
            source={{ uri: item.reviewerProfile.profileImage }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profilePlaceholder} />
        )}
        <Text style={styles.nickname}>
          {item.reviewerProfile?.nickname || '알 수 없음'} 님
        </Text>
      </View>

      <Text style={styles.rating}>⭐ {item.rating}점</Text>
      {item.summary ? <Text style={styles.summary}>{item.summary}</Text> : null}
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.tags}>
        {item.tags?.map((tag) => (
          <Text key={tag} style={styles.tag}>{tag}</Text>
        ))}
      </View>
      <Text style={styles.date}>
        {item.createdAt?.toDate
          ? new Date(item.createdAt.toDate()).toLocaleString()
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

      {/* 🔽 정렬 버튼 */}
      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortType === 'latest' && styles.sortSelected,
          ]}
          onPress={() => setSortType('latest')}
        >
          <Text style={styles.sortText}>최신순</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortType === 'rating' && styles.sortSelected,
          ]}
          onPress={() => setSortType('rating')}
        >
          <Text style={styles.sortText}>별점순</Text>
        </TouchableOpacity>
      </View>

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
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  nickname: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  rating: { fontSize: 18, fontWeight: '600', color: '#FFD700' },
  summary: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  content: { fontSize: 14, marginTop: 6, color: '#444' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
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
    marginTop: 6,
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});
