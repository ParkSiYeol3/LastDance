import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Footer from '../components/Footer';

const dummyRooms = [
  { id: '1', name: '시열님과 거래 채팅' },
  { id: '2', name: '영훈님과 거래 채팅' },
];

const ChatList = ({ navigation }) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>채팅 목록</Text>

        {dummyRooms.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatRoom', { roomId: item.id })}
          >
            <Text style={styles.chatName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Footer 공간 확보
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60, // Footer 높이 고정
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chatItem: {
    padding: 15,
    backgroundColor: '#31C585',
    marginBottom: 10,
    borderRadius: 8,
  },
  chatName: {
    fontSize: 16,
  },
});