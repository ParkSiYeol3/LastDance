import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import Footer from '../components/Footer';
import ChatListItem from './ChatListItem';

const chatData = [
  {
    id: '1',
    name: '시열',
    lastTime: '오전 04:02',
    lastMessage: '아직 물건 있을까요~?',
    imageUrl: 'https://example.com/item.jpg',
    profileImageUrl: 'https://example.com/profile1.jpg',
    unread: 2,
  },
  {
    id: '2',
    name: '영훈',
    lastTime: '어제',
    lastMessage: '네 확인했습니다!',
    imageUrl: '',
    profileImageUrl: 'https://example.com/profile2.jpg',
    unread: 0,
  },
];

const ChatList = ({ navigation }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>채팅 목록</Text>

        <FlatList
          data={chatData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ChatRoom', { roomId: item.id })
              }
            >
              <ChatListItem
                name={item.name}
                time={item.lastTime}
                message={item.lastMessage}
                imageUrl={item.imageUrl}
                profileImageUrl={item.profileImageUrl}
                unreadCount={item.unread}
              />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 하단 고정 Footer */}
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Footer 공간 확보
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
