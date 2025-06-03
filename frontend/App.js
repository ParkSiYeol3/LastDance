import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import { registerPushToken } from './utils/registerPushToken';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

// 기존 import 유지
import { db } from './firebase-config';
import Login from './components/Login';
import Register from './components/Register';
import FindAccount from './components/FindAccount';
import MyPage from './components/MyPage';
import Settings from './components/Settings';
import Rank from './components/Rank';
import Footer from './components/Footer';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import ReportScreen from './components/ReportScreen';
import AddItemScreen from './components/AddItemScreen';
import Deposit from './components/Deposit';
import Notice from './components/Notice';
import SalesHistory from './components/SalesHistory';
import Favorites from './components/Favorites';
import MapScreen from './components/Map';
import SplashScreen from './components/SplashScreen';
import ItemDetail from './components/ItemDetail';
import Home from './components/Home';
import StripeCheckoutScreen from './components/StripeCheckoutScreen';
import ReviewForm from './components/ReviewForm';
import ReviewList from './components/ReviewList';
import RentalRequests from './components/RentalRequests';
import AdminDashboard from './components/AdminDashboard';
import AdminReports from './components/AdminReports';
import StainDetector from './components/StainDetector';

const Stack = createStackNavigator();

export default function App() {
	const notificationListener = useRef();
	const responseListener = useRef();

	useEffect(() => {
		const auth = getAuth();

		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				registerPushToken();
			}
		});

		// 📥 알림 수신
		notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
			console.log('📨 알림 수신됨:', notification);
		});

		// 👆 알림 클릭
		responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
			console.log('👆 알림 클릭됨:', response);
		});

		return () => {
			unsubscribe();
			Notifications.removeNotificationSubscription(notificationListener.current);
			Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	return (
		<StripeProvider publishableKey='pk_test_...' urlScheme='tryclothes'>
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
					<Stack.Screen name='StripeCheckoutScreen' component={StripeCheckoutScreen} />
					<Stack.Screen name='ReportScreen' component={ReportScreen} />
					<Stack.Screen name='Write' component={AddItemScreen} />
					<Stack.Screen name='MyPage' component={MyPage} />
					<Stack.Screen name='AdminReports' component={AdminReports} />
					<Stack.Screen name='Footer' component={Footer} />
					<Stack.Screen name='Settings' component={Settings} />
					<Stack.Screen name='Deposit' component={Deposit} />
					<Stack.Screen name='Notice' component={Notice} />
					<Stack.Screen name='SalesHistory' component={SalesHistory} />
					<Stack.Screen name='Favorites' component={Favorites} />
					<Stack.Screen name='Rank' component={Rank} />
					<Stack.Screen name='Map' component={MapScreen} />
					<Stack.Screen name='ItemDetail' component={ItemDetail} />
					<Stack.Screen name='ReviewList' component={ReviewList} options={{ title: '거래 후기' }} />
					<Stack.Screen name='RentalRequests' component={RentalRequests} />
					<Stack.Screen name='AdminDashboard' component={AdminDashboard} options={{ title: '감정 통계' }} />
					<Stack.Screen name='StainDetector' component={StainDetector} />
				</Stack.Navigator>
			</NavigationContainer>
		</StripeProvider>
	);
}
