import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ScrollView, Alert } from 'react-native';
import Footer from '../components/Footer';
import gearIcon from '../assets/gear.png';
import { db } from '../firebase-config';
import { getDoc, getDocs, doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const MyPage = ({ navigation }) => {
   const [userData, setUserData] = useState(null);
   const [averageRating, setAverageRating] = useState(null);
   const [userId, setUserId] = useState(null);

   useEffect(() => {
      let unsubscribeRating = null;

      const fetchUserData = async () => {
         try {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) {
               console.log('userId 없음');
               return;
            }
            setUserId(storedUserId);
            await checkRatingSnapshotDebug(storedUserId);
            const userDocRef = doc(db, 'users', storedUserId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
               setUserData(userDocSnap.data());

               const q = query(collection(db, 'reviews'), where('targetUserId', '==', storedUserId));
               unsubscribeRating = onSnapshot(q, (snapshot) => {
                  const ratings = snapshot.docs.map((doc) => doc.data().rating);
                  if (ratings.length > 0) {
                     const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
                     setAverageRating(avg);
                  } else {
                     setAverageRating('0.0');
                  }
               });
            } else {
               console.log('사용자 데이터 없음');
            }
         } catch (error) {
            console.error('사용자 정보 가져오기 실패:', error);
         }
      };
      fetchUserData();
      return () => {
         if (unsubscribeRating) unsubscribeRating();
      };
   }, []);

   const checkRatingSnapshotDebug = async (storedUserId) => {
      console.log('🔧 실시간 평점 디버깅 시작...');
      if (!storedUserId) {
         console.warn('⛔ userId가 undefined입니다.');
         return;
      }

      try {
         const q = query(collection(db, 'reviews'), where('targetUserId', '==', storedUserId));
         const snapshot = await getDocs(q);
         console.log(`📄 조건에 맞는 리뷰 개수: ${snapshot.size}`);

         if (snapshot.empty) {
            console.warn('⚠️ 조건에 맞는 리뷰가 없습니다.');
         }

         snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`✅ 리뷰 문서:`, {
               id: doc.id,
               rating: data.rating,
               targetUserId: data.targetUserId,
               reviewerId: data.reviewerId,
            });

            if (!data.targetUserId) {
               console.warn(`⛔ 문서에 targetUserId 필드 없음! ID: ${doc.id}`);
            } else if (data.targetUserId !== storedUserId) {
               console.warn(`⚠️ targetUserId 불일치! 문서: ${doc.id}`);
            }
         });
      } catch (err) {
         console.error('🚨 리뷰 쿼리 중 오류 발생:', err);
      }
   };

   const openSettings = () => {
      navigation.navigate('Settings');
   };

   const handleCamera = async () => {
      const result = await ImagePicker.launchCameraAsync({
         allowsEditing: true,
         quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
         const imageUri = result.assets[0].uri;

         const formData = new FormData();
         formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
         });

         try {
            const response = await fetch('http://59.27.213.240:8082/predict', {
               method: 'POST',
               headers: {
                  'Content-Type': 'multipart/form-data',
               },
               body: formData,
            });

            const data = await response.json();

            if (data.predictions && data.predictions.length > 0) {
               const summary = data.predictions.map((p) => `ID: ${p.class_id}, 확률: ${(p.confidence * 100).toFixed(1)}%`).join('\n');
               Alert.alert('AI 감지 결과', summary);
            } else {
               Alert.alert('AI 감지 결과', '감지된 얼룩이 없습니다.');
            }
         } catch (err) {
            console.error(err);
            Alert.alert('서버 오류', 'Flask 서버 연결 실패');
         }
      }
   };

   const handlePickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: false,
         quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
         const imageUri = result.assets[0].uri;

         const formData = new FormData();
         formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
         });

         try {
            const response = await fetch('http://59.27.213.240:8082/predict', {
               method: 'POST',
               headers: {
                  'Content-Type': 'multipart/form-data',
               },
               body: formData,
            });

            const data = await response.json();

            if (data.predictions && data.predictions.length > 0) {
               const summary = data.predictions.map((p) => `ID: ${p.class_id}, 확률: ${(p.confidence * 100).toFixed(1)}%`).join('\n');
               Alert.alert('AI 감지 결과', summary);
            } else {
               Alert.alert('AI 감지 결과', '감지된 얼룩이 없습니다.');
            }
         } catch (err) {
            console.error(err);
            Alert.alert('서버 오류', 'Flask 서버 연결 실패');
         }
      }
   };

   if (!userData) {
      return (
         <View style={styles.screen}>
            <StatusBar barStyle='dark-content' />
            <Text>로딩 중...</Text>
         </View>
      );
   }

   return (
      <View style={styles.screen}>
         <StatusBar barStyle='dark-content' />

         <View style={styles.header}>
            <Image source={require('../assets/Logo.png')} style={styles.logo} />
            <Text style={styles.appName}>이거옷대여?</Text>
         </View>

         <View style={styles.profileBox}>
            <Image source={{ uri: userData.profileImage || 'https://via.placeholder.com/60' }} style={styles.profileImage} />
            <View style={styles.profileInfo}>
               <Text style={styles.nickname}>{userData.name} 님</Text>
               <Text style={styles.rating}>⭐ {averageRating ?? '0.0'} / 5</Text>
            </View>
            <TouchableOpacity onPress={openSettings} style={styles.gearButton}>
               <Image source={gearIcon} style={styles.gearIcon} />
            </TouchableOpacity>
         </View>

         <TouchableOpacity onPress={() => navigation.navigate('ReviewListTabs', { userId: userId, type: 'received' })} style={styles.reviewButton}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Image source={require('../assets/review.png')} style={styles.iconImage} />
               <Text style={styles.reviewButtonText}>내가 받은 리뷰 보기</Text>
            </View>
         </TouchableOpacity>

         <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.menuBox}>
               <MenuItem icon={require('../assets/SalesHistory.png')} label='보증금 결제 내역' onPress={() => navigation.navigate('SalesHistory')} />
               <MenuItem icon={require('../assets/blackHeart.png')} label='관심 상품' onPress={() => navigation.navigate('Favorites')} />
               <MenuItem icon={require('../assets/RecentViews.png')} label='최근 본 상품' onPress={() => navigation.navigate('RecentViews')} />
               <MenuItem icon={require('../assets/Notice.png')} label='공지사항' onPress={() => navigation.navigate('Notice')} />
               <MenuItem icon={require('../assets/RentalRequests.png')} label='승인 요청 내역' onPress={() => navigation.navigate('RentalRequests')} />
            </View>

            {userData.role === 'admin' && (
               <>
                  <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('AdminDashboard')}>
                     <Text style={styles.adminButtonText}>📊 관리자 통계 보기</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.adminButton, { marginTop: 12 }]} onPress={() => navigation.navigate('AdminReports')}>
                     <Text style={styles.adminButtonText}>🚨 신고 내역 관리</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.adminButton, { marginTop: 12 }]} onPress={handleCamera}>
                     <Text style={styles.adminButtonText}>📷 얼룩 감지 테스트</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.adminButton, { marginTop: 12 }]} onPress={handlePickImage}>
                     <Text style={styles.adminButtonText}>🖼 갤러리 이미지로 테스트</Text>
                  </TouchableOpacity>
               </>
            )}
         </ScrollView>

         <View style={styles.footer}>
            <Footer navigation={navigation} />
         </View>
      </View>
   );
};

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItem}>
    <View style={styles.menuItemContent}>
      <Image source={icon} style={styles.iconImage} />
      <Text style={styles.menuText}>{label}</Text>
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

export default MyPage;

const styles = StyleSheet.create({
   screen: {
      flex: 1,
      backgroundColor: '#ffffff',
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderBottomColor: '#eee',
   },
   logo: {
      width: 70,
      height: 70,
      resizeMode: 'contain',
   },
   appName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#31c585',
      marginLeft: 5,
      marginBottom: 5,
   },
   content: {
      padding: 20,
      paddingBottom: 100,
   },
   footer: {
      position: 'absolute',
      bottom: 0,
      height: 83,
      width: '100%',
   },
   profileBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e8f0fe',
      padding: 20,
      borderRadius: 50,
      marginBottom: 20,
   },
   profileImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
   },
   profileInfo: {
      flex: 1,
   },
   nickname: {
      fontSize: 18,
      fontWeight: 'bold',
   },
   rating: {
      fontSize: 14,
      color: '#333',
      marginTop: 4,
   },
   trust: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
   },
   starIcon: {
      width: 15,
      height: 15,
   },
   gearButton: {
      padding: 6,
   },
   gearIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
   },
   reviewButton: {
      marginHorizontal: 20,
      marginBottom: 10,
      padding: 12,
      backgroundColor: '#e0f7fa',
      borderRadius: 10,
      alignItems: 'center',
   },
   iconImage: {
      width: 20,
      height: 20,
      marginRight: 10,
      resizeMode: 'contain',
   },
   reviewButtonText: {
      color: '#00796b',
      fontWeight: 'bold',
      fontSize: 15,
   },
   menuBox: {
      borderTopWidth: 1,
      borderColor: '#eee',
      marginTop: 12,
   },
   menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderColor: '#eee',
   },
   menuItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   iconImage: {
      width: 20,
      height: 20,
      marginRight: 10,
      resizeMode: 'contain',
   },
   menuText: {
      fontSize: 16,
   },
   menuArrow: {
      fontSize: 20,
      color: '#999',
   },
   adminButton: {
      marginTop: 20,
      backgroundColor: '#4CAF50',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
   },
   adminButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
   },
});
