import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Footer from './Footer';

const Write = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 이미지 등록 */}
        <TouchableOpacity style={styles.imageUpload}>
          <Image
            source={require('../assets/camera.png')}
            style={styles.cameraIcon}
          />
        </TouchableOpacity>

        {/* 제목 */}
        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          placeholder="이 옷 공유합니다"
          value={title}
          onChangeText={setTitle}
        />

        {/* 내용 */}
        <Text style={styles.label}>게시물 내용</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="이 옷 공유합니다"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={5}
        />

        {/* 대여 기간 */}
        <Text style={styles.label}>기간은 얼마인가요?</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={styles.dateInput}
            value="2025-03-27"
            editable={false}
          />
          <Text style={{ marginHorizontal: 8 }}>~</Text>
          <TextInput
            style={styles.dateInput}
            value="2025-04-02"
            editable={false}
          />
        </View>

        {/* 가격 */}
        <Text style={styles.label}>1일당 얼마인가요?</Text>
        <TextInput
          style={[styles.input, { width: 100 }]}
          value={pricePerDay}
          onChangeText={setPricePerDay}
          keyboardType="numeric"
          placeholder="₩"
        />

        {/* 작성 버튼 */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>작성하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 하단 고정 Footer */}
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
    paddingBottom: 100, // Footer 공간 확보
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60, // Footer 높이
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