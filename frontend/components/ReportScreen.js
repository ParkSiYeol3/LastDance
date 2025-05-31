// screens/ReportScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../firebase-config'; // 실제 API_URL 경로와 맞추세요

const ReportScreen = ({ route, navigation }) => {
  const { targetUserId, reporterId } = route.params;

  const [reason, setReason] = useState('');
  const [targetNickname, setTargetNickname] = useState(null);
  const [loadingNickname, setLoadingNickname] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${targetUserId}`);
        // API 응답 예시:
        // 성공 시 res.data가 { user: { nickname: '홍길동', ... } }
        // 혹은 { nickname: '홍길동', ... } 형태일 수 있습니다.
        let nickname = null;

        if (res.data?.user?.nickname) {
          nickname = res.data.user.nickname;
        } else if (res.data?.nickname) {
          nickname = res.data.nickname;
        } else {
          // 응답 구조가 예상과 다르면, raw res.data 내용을 콘솔에서 확인해 주세요.
          console.warn('Unexpected response for user profile:', res.data);
          nickname = targetUserId; // fallback: UID 보여주기
        }

        setTargetNickname(nickname);
      } catch (err) {
        console.error('사용자 프로필 조회 실패:', err.response?.data || err.message);
        Alert.alert(
          '오류',
          '신고 대상을 불러오는 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.'
        );
        setTargetNickname(targetUserId);
      } finally {
        setLoadingNickname(false);
      }
    };

    fetchUserProfile();
  }, [targetUserId]);

  const submitReport = async () => {
    if (!reason.trim()) {
      Alert.alert('입력 오류', '신고 사유를 입력해주세요.');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/reports`, {
        reporterId,
        reportedUserId: targetUserId,
        reason: reason.trim(),
      });
      Alert.alert('완료', '신고가 정상적으로 접수되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('신고 제출 실패:', err.response?.data || err.message);
      Alert.alert('오류', '신고 제출 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>사용자 신고</Text>

          {loadingNickname ? (
            <ActivityIndicator size="small" color="#FF3B30" style={{ marginBottom: 20 }} />
          ) : (
            <>
              <Text style={styles.label}>신고 대상:</Text>
              <Text style={styles.targetName}>{targetNickname}</Text>
            </>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>신고 사유를 입력해주세요:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="사유를 입력하세요"
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
            autoFocus
          />

          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                navigation.goBack();
                Keyboard.dismiss();
              }}
            >
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.submitButton]}
              onPress={submitReport}
            >
              <Text style={styles.buttonText}>제출</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#FF3B30',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  targetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    height: 120,
    marginBottom: 20,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  submitButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
