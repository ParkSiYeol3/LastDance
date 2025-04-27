// components/Favorites.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Footer from '../components/Footer';

const favoriteItems = [
  {
    id: '1',
    title: '갤럭시 버즈2 프로',
    location: '서울 마포구',
    price: '150,000원',
  },
  {
    id: '2',
    title: '닌텐도 스위치 OLED',
    location: '서울 영등포구',
    price: '350,000원',
  },
];

const Favorites = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>관심목록</Text>

      <ScrollView style={styles.scrollView}>
        {favoriteItems.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            {/* <Image style={styles.itemImage} source={require('../assets/sample.png')} /> */}
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemLocation}>{item.location}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <Text style={styles.heartIcon}>❤️</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollView: {
    marginBottom: 60,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemLocation: {
    color: '#666',
    marginVertical: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  heartIcon: {
    fontSize: 20,
    color: '#FF4500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});