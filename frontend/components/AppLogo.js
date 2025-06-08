import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const AppLogo = ({ size = 100 }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/Logo.png')} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
};

export default AppLogo;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
});