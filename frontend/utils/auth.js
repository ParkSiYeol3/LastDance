// utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ 로그인할 때 AsyncStorage에 저장하는 방식이어야 함

export const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken'); 
    return token;
  } catch (error) {
    console.error('토큰 가져오기 실패', error);
    return null;
  }
};
