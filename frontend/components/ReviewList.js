import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const API_URL = 'http://192.168.0.6:3000';

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
      console.log('📦 받아온 전체 응답:', json); // 디버깅용
      setReviews(Array.isArray(json.reviews) ? json.reviews : []);
    } catch (err) {
      console.error('리뷰 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverage = async () => {
    try {
      if (!userId) return;
      const res = await fetch(`${API_URL}/api/reviews/average/${userId}`);
      const json = await res.json();
      setAverageRating(json.average);
      setReviewCount(json.count);
    } catch (err) {
      console.error('평균 별점 불러오기 실패:', err);
    }
  };
=======
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';

const API_URL = 'http:///10.20.76.18:3000';

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
>>>>>>> 94f7e470e02794912e941516186b0923bf43c2ce

	useEffect(() => {
		fetchReviews();
		if (type === 'received') fetchAverage();
	}, []);

<<<<<<< HEAD
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
      <Text style={styles.nickname}>👤 작성자 UID: {item.reviewerId}</Text>
      <Text style={styles.rating}>⭐ 별점: {item.rating}점</Text>
      <Text style={styles.rentalItemName}>🧥 아이템 UID: {item.rentalItemId}</Text>

      {item.content ? (
        <Text style={styles.content}>📝 {item.content}</Text>
      ) : (
        <Text style={styles.content}>(내용 없음)</Text>
      )}

      <View style={styles.tags}>
        {Array.isArray(item.tags) &&
          item.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>{tag}</Text>
          ))}
      </View>
      <Text style={styles.date}>
        {item.createdAt?.seconds
          ? new Date(item.createdAt.seconds * 1000).toLocaleString()
          : ''}
      </Text>
    </View>
  );
=======
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
				{item.reviewerProfile?.profileImage ? <Image source={{ uri: item.reviewerProfile.profileImage }} style={styles.profileImage} /> : <View style={styles.profilePlaceholder} />}
				<Text style={styles.nickname}>{item.reviewerProfile?.nickname || '알 수 없음'} 님</Text>
			</View>

			<Text style={styles.rating}>⭐ {item.rating}점</Text>
			{item.summary ? <Text style={styles.summary}>{item.summary}</Text> : null}
			<Text style={styles.content}>{item.content}</Text>
			<View style={styles.tags}>
				{item.tags?.map((tag) => (
					<Text key={tag} style={styles.tag}>
						{tag}
					</Text>
				))}
			</View>
			<Text style={styles.date}>{item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleString() : ''}</Text>
		</View>
	);
>>>>>>> 94f7e470e02794912e941516186b0923bf43c2ce

	if (loading) {
		return <ActivityIndicator size='large' style={{ marginTop: 50 }} />;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{type === 'received' ? '받은 리뷰' : '작성한 리뷰'}</Text>

			{type === 'received' && averageRating !== null && (
				<Text style={styles.average}>
					🌟 평균 별점: {averageRating}점 ({reviewCount}개 리뷰)
				</Text>
			)}

<<<<<<< HEAD
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
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        initialNumToRender={5}
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
    marginBottom: 6,
    color: '#444',
  },
  rentalItemName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  rating: { fontSize: 16, fontWeight: '600', color: '#FFD700' },
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
=======
			{/* 🔽 정렬 버튼 */}
			<View style={styles.sortRow}>
				<TouchableOpacity style={[styles.sortButton, sortType === 'latest' && styles.sortSelected]} onPress={() => setSortType('latest')}>
					<Text style={styles.sortText}>최신순</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.sortButton, sortType === 'rating' && styles.sortSelected]} onPress={() => setSortType('rating')}>
					<Text style={styles.sortText}>별점순</Text>
				</TouchableOpacity>
			</View>

			<FlatList data={getSortedReviews()} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 50 }} />
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
>>>>>>> 94f7e470e02794912e941516186b0923bf43c2ce
});
