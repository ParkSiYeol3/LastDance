import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Footer from './Footer';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

const CLOUD_NAME = 'daqpozmek';
const UPLOAD_PRESET = 'Lastdance';
const SERVER_URL = 'http://192.168.0.24:3000'; // ⚠️ 실제 IP 또는 도메인으로 변경

const AddItemScreen = ({ navigation }) => {
	const [name, setName] = useState('');
  	const [description, setDescription] = useState('');
  	const [imageInput, setImageInput] = useState('');
  	const [imageURLs, setImageURLs] = useState([]);
  	const [uploading, setUploading] = useState(false);
  	const [category, setCategory] = useState('');


  const categoryStyles = {
    상의: { icon: '👕', color: '#31C585' },
	하의: { icon: '👖', color: '#4A90E2' },
	신발: { icon: '👟', color: '#FFA500' },
	가방: { icon: '👜', color: '#9B59B6' },
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageURLs((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleAddImageURL = () => {
    if (imageInput.trim()) {
      setImageURLs((prev) => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !category || imageURLs.length === 0) {
      Alert.alert('필수 입력', '모든 필드를 입력해주세요.');
      return;
    }
    setUploading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '위치 권한을 허용해야 합니다.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const user = auth.currentUser;
      await addDoc(collection(db, 'items'), {
        userId: user.uid,
        name,
        description,
        category,
        imageURLs,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: serverTimestamp(),
      });
      Alert.alert('성공', '상품이 등록되었습니다.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('실패', '상품 등록에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>게시글 작성</Text>

        <TextInput
          placeholder="상품명"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="상품 설명"
          style={[styles.input, styles.textArea]}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.categoryContainer}>
          {Object.keys(categoryStyles).map((cat) => {
            const selected = category === cat;
            const { icon, color } = categoryStyles[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, selected && { backgroundColor: color }]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, selected && { color: '#fff' }]}>{icon} {cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.imageRow}>
          <TextInput
            placeholder="이미지 URL"
            style={[styles.input, { flex: 1 }]}
            value={imageInput}
            onChangeText={setImageInput}
          />
          <TouchableOpacity style={styles.urlAddBtn} onPress={handleAddImageURL}>
            <Text style={{ color: '#fff' }}>추가</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cameraBtn} onPress={handleTakePhoto}>
          <Text style={styles.cameraText}>📷 카메라로 촬영하기</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {imageURLs.map((url, idx) => (
            <Image key={idx} source={{ uri: url }} style={styles.image} />
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={uploading}>
          <Text style={styles.submitText}>{uploading ? '등록 중...' : '작성하기'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </>
  );
};

export default AddItemScreen;

const styles = StyleSheet.create({
	container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryBtn: {
  	borderWidth: 1,
  	borderColor: '#ccc',
  	borderRadius: 12,          
  	paddingVertical: 14,        
  	paddingHorizontal: 20,      
  	marginRight: 10,
  	marginBottom: 12,
  	minWidth: 100,              
  	alignItems: 'center',      
  },
  categoryText: {
  	color: '#333',
  	fontSize: 15,               
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  urlAddBtn: {
    marginLeft: 8,
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  cameraBtn: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  submitBtn: {
    backgroundColor: '#31C585',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    height: 85,
    width: '100%',
  },
});
