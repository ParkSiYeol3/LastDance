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
      // 1) PaymentSheet 초기화
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

      // 2) PaymentSheet 표시 및 결제 진행
      const { error: presentError, paymentIntent } = await presentPaymentSheet();
      if (presentError) {
        Alert.alert('결제 실패', presentError.message);
        navigation.goBack();
      } else if (paymentIntent) {
        // 3) 결제 성공
        Alert.alert('결제 성공!', '보증금 결제가 완료되었습니다.');

        try {
          // 4) 필요한 정보 불러오기
          const userId = await AsyncStorage.getItem('userId');
          // rentalItemId는 ChatRoom에서 결제 요청 전에 AsyncStorage에 미리 저장해 두었다고 가정합니다.
          // 예: AsyncStorage.setItem('currentRentalItemId', rentalItemId);
          const rentalItemId = await AsyncStorage.getItem('currentRentalItemId');

          // 5) 결제 상태 업데이트 API 호출 (여기에 paymentIntent.id를 반드시 포함)
          await axios.post(`${API_URL}/api/deposit/confirm-payment`, {
            paymentIntentId: paymentIntent.id,
            userId,
            rentalItemId,
          });

        } catch (err) {
          console.error('결제 상태 업데이트 실패:', err);
          Alert.alert('오류', '결제 완료 후 상태 업데이트에 실패했습니다.');
        }

        // 6) 결제 완료 후 이전 화면으로 돌아가기
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
