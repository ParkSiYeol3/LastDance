import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Footer from './Footer';

const API_URL = 'http://172.30.1.11:3000';

const ReviewListTabs = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  const [tab, setTab] = useState('received');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);

  const fetchReviews = async (type) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${type}/${userId}`);
      const json = await res.json();
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
    setLoading(true);
    fetchReviews(tab);
    if (tab === 'received') fetchAverage();
  }, [tab]);

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
      {item.sentiment && (
        <Text style={styles.sentiment}>
          감정 분석: {item.sentiment === 'positive' ? '👍 긍정' : item.sentiment === 'negative' ? '👎 부정' : '😐 중립'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 리뷰</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setTab('received')} style={[styles.tabButton, tab === 'received' && styles.tabActive]}>
          <Text style={styles.tabText}>받은 리뷰</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab('written')} style={[styles.tabButton, tab === 'written' && styles.tabActive]}>
          <Text style={styles.tabText}>작성한 리뷰</Text>
        </TouchableOpacity>
      </View>

      {tab === 'received' && averageRating !== null && (
        <Text style={styles.average}>
          🌟 평균 별점: {averageRating}점 ({reviewCount}개 리뷰)
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
            <Footer navigation={navigation}/>
        </View>

    </View>
  );
};

export default ReviewListTabs;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  tabContainer: { 
    flexDirection: 'row', 
    marginBottom: 12 
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: '#ccc',
  },
  tabActive: {
    borderColor: '#00bcd4',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#555',
    marginTop: 6,
  },
  footer: {
		position: 'absolute',
		bottom: 0,
		height: 83,
		width: '109%',
  },
});
