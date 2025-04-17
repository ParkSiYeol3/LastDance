import React from 'react';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, FlatList, Image} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 컴포넌트들 import
import Login from './components/Login';
import Register from './components/Register';
import FindAccount from './components/FindAccount';
import MyPage from './components/MyPage';
import Map from './components/Map';
import Settings from './components/Settings'; 
import Rank from './components/Rank';
import Footer from './components/Footer';
import ChatList from './components/ChatList';
import ChatListItem from './components/ChatListItem';
import ChatRoom from './components/ChatRoom';
import Write from './components/Write';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="FindAccount" component={FindAccount} />
        <Stack.Screen name="ChatList" component={ChatList} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        <Stack.Screen name="Write" component={Write} />
        <Stack.Screen name="Map" component={Map} />
        <Stack.Screen name="MyPage" component={MyPage} />
        <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }}/>
        <Stack.Screen
  name="Rank"
  component={Rank}
  options={{ headerShown: false }} // 기본 헤더 숨기기
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Home 화면 (로그인, 회원가입, 아이디/비밀번호 찾기 버튼 포함)
function HomeScreen({ navigation }) {
  const categories = [
    { id: '1', name: '상의', icon: require('./assets/top.png') },
    { id: '2', name: '하의', icon: require('./assets/bottom.png') },
    { id: '3', name: '신발', icon: require('./assets/shoes.png') },
    { id: '4', name: '가방', icon: require('./assets/bag.png') },
  ];

  return (
    <View style={styles.screen}>
      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.input} placeholder="검색어를 입력하세요" />
        <TouchableOpacity style={styles.searchButton}>
          <Image source={require('./assets/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {/* 카테고리 섹션 */}
      <Text style={styles.sectionTitle}>카테고리</Text>
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryCard}>
            <Image source={item.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{item.name}</Text>
            <Text style={styles.arrow}>➤</Text>
          </TouchableOpacity>
        )}
      />

      {/* 글쓰기 버튼 */}
      <TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate('Write')}>
        <Text style={styles.writeText}>글쓰기</Text>
      </TouchableOpacity>

      {/* 하단바 */}
      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#1976d2',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#3371EF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoryCard: {
    width: 90,
    height: 130,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 16,
    color: 'gold',
  },
  writeButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#3371EF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  writeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});