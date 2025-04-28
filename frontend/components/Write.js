import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Footer from './Footer';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Write = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!name || !description) {
      Alert.alert('알림', '제목과 내용을 입력해주세요.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // Firestore에 imageURL 없이 저장
      await addDoc(collection(db, 'items'), {
        name: name,
        description: description,
        userId: userId,
        timestamp: serverTimestamp(),
      });

      Alert.alert('성공', '게시물이 등록되었습니다!');
      navigation.replace('Home');
    } catch (error) {
      console.error('게시물 등록 오류:', error);
      Alert.alert('등록 실패', error.message);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          placeholder="제목을 입력하세요"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>게시물 내용</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="내용을 입력하세요"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>작성하기</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Write;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
  },
  imageUpload: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  cameraIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1c3faa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#1c3faa',
    borderRadius: 8,
    padding: 10,
    width: 130,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#3371EF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});