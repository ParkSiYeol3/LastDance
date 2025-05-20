// App.js (최종 정리된 전체 구조)
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StripeProvider } from '@stripe/stripe-react-native';
// Firebase
import { db } from './firebase-config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Screens
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
import Favorites from './components/Favorites';
import MapScreen from './components/Map';
import SplashScreen from './components/SplashScreen';
import ItemDetail from './components/ItemDetail';
import Home from './components/Home'; // ⭐ 새로 분리한 Home 컴포넌트
import StripeCheckoutScreen from './components/StripeCheckoutScreen'; 
import ReviewForm from './components/ReviewForm';


const Stack = createStackNavigator();

export default function App() {
	return (
		<StripeProvider
      publishableKey="pk_test_51RAVRA2MK3G0aVNyAbEK2BYKKnzwmHOsmkvAwTfD0vIP6CkDzb9TD4NdWJR0nTAvep5ig4Or2ZAR1wgUC804qS7U00YrHdeIWy" // 🔑 본인 키 입력
      urlScheme="tryclothes"
    >
		<NavigationContainer>
			<Stack.Navigator initialRouteName='Splash'>
				<Stack.Screen name='Splash' component={SplashScreen} />
				<Stack.Screen name='Home' component={Home} />
				<Stack.Screen name='Login' component={Login} />
				<Stack.Screen name='Register' component={Register} />
				<Stack.Screen name='FindAccount' component={FindAccount} />
				<Stack.Screen name='ChatList' component={ChatList} />
				<Stack.Screen name='ChatRoom' component={ChatRoom} />
				<Stack.Screen name='ReviewForm' component={ReviewForm} />
				<Stack.Screen name="StripeCheckoutScreen" component={StripeCheckoutScreen} />
				<Stack.Screen name='Write' component={Write} />
				<Stack.Screen name='MyPage' component={MyPage} />
				<Stack.Screen name='Footer' component={Footer} />
				<Stack.Screen name='Settings' component={Settings} />
				<Stack.Screen name='Deposit' component={Deposit} />
				<Stack.Screen name='Notice' component={Notice} />
				<Stack.Screen name='SalesHistory' component={SalesHistory} />
				<Stack.Screen name='Favorites' component={Favorites} />
				<Stack.Screen name='Rank' component={Rank} />
				<Stack.Screen name='Map' component={MapScreen} />
				<Stack.Screen name='ItemDetail' component={ItemDetail} />
				
			</Stack.Navigator>
		</NavigationContainer>
		</StripeProvider>
	);
}
