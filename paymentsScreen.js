import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const DepositStatusScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = 'oOe27Qwhfwew6popAp3vXozVwWn1'; // 테스트용 UID

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/deposit/user-payments/${userId}`);
        const data = await res.json();
        if (data.payments && data.payments.length > 0) {
          setPayments(data.payments);
        } else {
          setError('결제 내역이 없습니다.');
        }
      } catch (err) {
        setError('❌ 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('에러:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 보증금 결제 내역</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        payments.map((p, index) => (
          <View key={index} style={styles.paymentItem}>
            <Text style={styles.paymentText}>
              🧥 아이템ID: {p.rentalItemId} | 💰 금액: ₩{p.amount} | 📦 상태: 
              {p.status === 'refunded' ? '✅ 반환됨' : '⏳ 결제완료'}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  paymentText: {
    fontSize: 16,
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DepositStatusScreen;
