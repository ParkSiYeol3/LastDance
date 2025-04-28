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


export const refreshToken = async () => {
  try {
    const response = await axios.post('/api/refresh-token');  // 서버에서 토큰을 갱신하는 API 호출
    const { newToken } = response.data;  // 새로운 토큰 받기
    localStorage.setItem('accessToken', newToken);  // 새 토큰 저장
    return newToken;
  } catch (error) {
    console.error('토큰 재발급 실패:', error);
    throw error;
  }
};
