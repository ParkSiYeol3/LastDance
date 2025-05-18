import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../firebase-config'; // ✅ API base URL

const StripeCheckoutScreen = ({ route, navigation }) => {
  const { clientSecret } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const initAndPresent = async () => {
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: '이거옷대여',
      });

      if (initError) {
        console.error('PaymentSheet 초기화 오류:', initError);
        Alert.alert('오류', '결제 초기화 실패');
        navigation.goBack();
        return;
      }

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        Alert.alert('결제 실패', presentError.message);
        navigation.goBack();
      } else {
        Alert.alert('결제 성공!', '보증금 결제가 완료되었습니다.');

        // ✅ 결제 성공 후 결제 상태 서버에 알림
        try {
          const userId = await AsyncStorage.getItem('userId');
          const rentalItemId = await AsyncStorage.getItem('currentRentalItemId'); // 이 값은 결제 요청 시에 저장해둬야 함
          await axios.post(`${API_URL}/api/deposit/confirm-payment`, {
            userId,
            rentalItemId,
          });
        } catch (err) {
          console.error('결제 상태 업데이트 실패:', err);
        }

        navigation.goBack();
      }
    };

    initAndPresent();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default StripeCheckoutScreen;
