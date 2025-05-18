// components/StripeCheckoutScreen.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

const StripeCheckoutScreen = ({ route, navigation }) => {
  const { clientSecret } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const initAndPresent = async () => {
      // 1. PaymentSheet 초기화
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'TryClothes', // 상점 이름
      });

      if (initError) {
        console.error('PaymentSheet 초기화 오류:', initError);
        Alert.alert('오류', '결제 초기화 실패');
        navigation.goBack();
        return;
      }

      // 2. PaymentSheet 표시
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        Alert.alert('결제 실패', presentError.message);
        navigation.goBack();
      } else {
        Alert.alert('결제 성공!', '보증금 결제가 완료되었습니다.');
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
