import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { db } from './firebase-config';  // Firebase Firestore import
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// 컴포넌트들 import
import Login from './components/Login';
import Register from './components/Register';
import FindAccount from './components/FindAccount';
import MyPage from './components/MyPage'; 
import Settings from './components/Settings'; 
import Rank from './components/Rank';
import Footer from './components/Footer';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import Write from './components/Write';
import Deposit from './components/Deposit';
import Notice from './components/Notice';
import SalesHistory from './components/SalesHistory';
import Favorites from './components/Favorites'; // 추가
import MapScreen from './components/Map'; // 상단에 추가
import SplashScreen from './components/SplashScreen';

const Stack = createStackNavigator();

export default function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPosts = [];

      querySnapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('게시글 불러오기 오류:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.postCard}>
      {/* 이미지 표시 (있을 경우만) */}
      {item.imageURL ? (
        <Image source={{ uri: item.imageURL }} style={styles.image} />
      ) : null}

      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home">
          {(props) => (
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
              <View style={styles.categoriesContainer}>
                <TouchableOpacity style={styles.categoryCard}>
                  <Image source={require('./assets/top.png')} style={styles.categoryIcon} />
                  <Text style={styles.categoryText}>상의</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryCard}>
                  <Image source={require('./assets/bottom.png')} style={styles.categoryIcon} />
                  <Text style={styles.categoryText}>하의</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryCard}>
                  <Image source={require('./assets/shoes.png')} style={styles.categoryIcon} />
                  <Text style={styles.categoryText}>신발</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryCard}>
                  <Image source={require('./assets/bag.png')} style={styles.categoryIcon} />
                  <Text style={styles.categoryText}>가방</Text>
                </TouchableOpacity>
              </View>

              {/* 글 목록 표시 */}
              <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
              />

              {/* 글쓰기 버튼 */}
              <TouchableOpacity style={styles.writeButton} onPress={() => props.navigation.navigate('Write')}>
                <Text style={styles.writeText}>글쓰기</Text>
              </TouchableOpacity>

              {/* 하단바 */}
              <View style={styles.footer}>
                <Footer navigation={props.navigation} />
              </View>
            </View>
          )}
        </Stack.Screen>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="FindAccount" component={FindAccount} />
        <Stack.Screen name="ChatList" component={ChatList} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        <Stack.Screen name="Write" component={Write} />
        <Stack.Screen name="MyPage" component={MyPage} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Deposit" component={Deposit} />
        <Stack.Screen name="Notice" component={Notice} />
        <Stack.Screen name="SalesHistory" component={SalesHistory} />
        <Stack.Screen name="Favorites" component={Favorites} />
        <Stack.Screen name="Rank" component={Rank} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: 70,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    elevation: 3,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 14,
  },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
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
  footer: {
    width: '100%',
  },
});
