import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase-config'; // 기존 프로젝트에서 초기화된 Firestore 인스턴스

const SalesHistory = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.log('userId 없음');
          setPayments([]);
          setLoading(false);
          return;
        }

        // payments 컬렉션에서 해당 userId의 문서만 조회
        const paymentsRef = collection(db, 'payments');
        const q = query(
          paymentsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        // 먼저 결제 데이터만 가져오기
        const rawPayments = [];
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          rawPayments.push({
            id: docSnap.id,
            amount: data.amount,
            status: data.status,
            createdAt: data.createdAt?.toDate() || null,
            rentalItemId: data.rentalItemId,
          });
        }

        // 각 결제에 대해 item 이름 가져오기
        const withNames = await Promise.all(
          rawPayments.map(async (payment) => {
            let itemName = '';
            try {
              const itemDocRef = doc(db, 'items', payment.rentalItemId);
              const itemSnap = await getDoc(itemDocRef);
              if (itemSnap.exists()) {
                itemName = itemSnap.data().name || '';
              } else {
                itemName = '알 수 없는 아이템';
              }
            } catch (error) {
              console.error('아이템 이름 조회 실패:', error);
              itemName = '알 수 없는 아이템';
            }
            return { ...payment, itemName };
          })
        );

        setPayments(withNames);
      } catch (error) {
        console.error('결제 내역 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const now = new Date();
    const diffMs = now - dateObj;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else {
      return `${diffDays}일 전`;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>나의 보증금 결제 내역</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4CAF50"
            style={{ marginTop: 50 }}
          />
        ) : payments.length === 0 ? (
          <Text style={styles.noDataText}>결제 내역이 없습니다.</Text>
        ) : (
          payments.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <View style={styles.itemContent}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>아이템: {item.itemName}</Text>
                  <Text style={styles.itemSub}>
                    금액: {item.amount.toLocaleString()}원
                  </Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                    <Text
                      style={[
                        styles.itemStatus,
                        item.status === 'refunded'
                          ? { color: '#9ACD32' }
                          : item.status === 'succeeded' || item.status === 'paid'
                          ? { color: '#4CAF50' }
                          : { color: '#FFC107' },
                      ]}
                    >
                      {item.status === 'refunded'
                        ? '환급 완료'
                        : item.status === 'succeeded' || item.status === 'paid'
                        ? '결제 완료'
                        : '결제 대기'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default SalesHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    paddingHorizontal: 16,
    marginTop: 30,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  itemContainer: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  itemSub: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemDate: {
    fontSize: 12,
    color: '#888',
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
