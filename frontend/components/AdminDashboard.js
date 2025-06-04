import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import Footer from '../components/Footer';


const API_URL = 'http://172.30.1.6:3000';



export default function AdminDashboard() {
	const navigation = useNavigation();
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`${API_URL}/api/admin/sentiment-summary`)
			.then((res) => res.json())
			.then((json) => {
				setData(json);
				setLoading(false);
			})
			.catch((err) => {
				console.error('불러오기 실패:', err);
				setLoading(false);
			});
	}, []);

	const renderItem = ({ item }) => {
		const total = item.count || 1;
		const pos = item.positive / total;
		const neg = item.negative / total;
		const neu = item.neutral / total;

		return (
			<View style={styles.card}>
				<View style={styles.row}>
					<Image source={{ uri: item.profileImage }} style={styles.avatar} />
					<View>
						<Text style={styles.nickname}>{item.nickname}</Text>
						<Text>
							👍 {item.positive} 👎 {item.negative} 😐 {item.neutral}
						</Text>
					</View>
				</View>
				<Progress.Bar progress={pos} color='green' width={null} unfilledColor='#eee' borderWidth={0} height={10} style={{ marginTop: 8 }} />
			</View>
		);
	};

	if (loading) {
		return <ActivityIndicator size='large' style={{ marginTop: 50 }} />;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>판매자 리뷰 감정 통계</Text>
			<FlatList data={data} keyExtractor={(item) => item.sellerId} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 50 }} />
			<View style={styles.footer}>
				<Footer navigation={navigation} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: '#fff' },
	title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
	card: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 10,
		padding: 16,
		marginBottom: 12,
		backgroundColor: '#f9f9f9',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
		backgroundColor: '#ccc',
	},
	nickname: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	homeButton: {
		alignSelf: 'flex-end',
		paddingVertical: 6,
		paddingHorizontal: 12,
		backgroundColor: '#4CAF50',
		borderRadius: 8,
		marginBottom: 12,
	},
	homeButtonText: {
		color: '#fff',
		fontWeight: '600',
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		width: '107%',
	},
});
