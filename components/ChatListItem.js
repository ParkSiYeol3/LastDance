import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const ChatListItem = ({
  name,
  time,
  message,
  unreadCount,
  imageUrl,         // 마지막 메시지에 포함된 사진
  profileImageUrl,  // 유저 프로필 이미지
}) => {
  return (
    <View style={styles.itemContainer}>
      {/* 프로필 사진 */}
      <Image
        source={
          profileImageUrl
            ? { uri: profileImageUrl }
            : require('../assets/profile.png') // 기본 이미지
        }
        style={styles.profileImage}
      />

      {/* 메시지 영역 */}
      <View style={styles.textContainer}>
        {/* 상단: 이름 & 시간 */}
        <View style={styles.headerRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        {/* 하단: 이미지 + 메시지 미리보기 */}
        <View style={styles.messageRow}>
          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          )}
          <Text style={styles.message} numberOfLines={1}>
            {message}
          </Text>
        </View>
      </View>

      {/* 안 읽은 메시지 수 뱃지 */}
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unreadCount}</Text>
        </View>
      )}
    </View>
  );
};

export default ChatListItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  message: {
    color: '#444',
    fontSize: 14,
    flexShrink: 1,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 6,
  },
  unreadBadge: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});