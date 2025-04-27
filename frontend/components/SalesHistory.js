import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Footer from '../components/Footer';

const salesData = [
  {
    id: '1',
    title: '에어팟 프로 판매합니다',
    location: '서울 강남구 · 2주 전',
    price: '180,000원',
    status: '거래완료',
    likes: 3,
    comments: 1,
  },
  {
    id: '2',
    title: '아이패드 9세대 판매',
    location: '서울 서초구 · 1달 전',
    price: '320,000원',
    status: '거래완료',
    likes: 5,
    comments: 2,
  },
  {
    id: '3',
    title: '나이키 운동화 260',
    location: '서울 송파구 · 3달 전',
    price: '50,000원',
    status: '거래완료',
    likes: 2,
    comments: 0,
  },
];

const SalesHistory = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>나의 판매내역</Text>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>😊</Text>
          </View>
        </View>

        <View style={styles.tab}>
          <Text style={styles.tabActive}>거래내역 {salesData.length}</Text>
        </View>

        {salesData.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={styles.itemContent}>
              {/* <Image style={styles.itemImage} source={require('../assets/sample.png')} /> */}
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemLocation}>{item.location}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
                <View style={styles.itemStatusContainer}>
                  <Text style={styles.itemStatus}>{item.status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.interactionBar}>
              <Text>💬 {item.comments}</Text>
              <Text>❤️ {item.likes}</Text>
            </View>
          </View>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 20,
  },
  tab: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 15,
  },
  tabActive: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    fontWeight: 'bold',
  },
  itemContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    justifyContent: 'space-around',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemLocation: {
    color: '#666',
  },
  itemPrice: {
    fontWeight: 'bold',
  },
  itemStatusContainer: {
    backgroundColor: '#ddd',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  itemStatus: {
    fontSize: 12,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
