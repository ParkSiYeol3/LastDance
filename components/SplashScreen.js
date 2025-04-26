import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (투명)

  useEffect(() => {
    // 화면 등장할 때 페이드 인
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500, // 1.5초 동안 천천히 등장
      useNativeDriver: true,
    }).start();

    // 등장 후 2초 기다리고 Home으로 이동
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/Logo.png')}
        style={[styles.logo, { opacity: fadeAnim }]} // ✅ opacity로 애니메이션
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
});