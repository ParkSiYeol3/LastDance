// AdminReports.js - 관리자 신고 내역 페이지
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { API_URL } from '../firebase-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AdminReports = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reports`);
      setReports(res.data);
    } catch (err) {
      Alert.alert('오류', '신고 목록 불러오기 실패');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reportId, reportedUserId, action) => {
    try {
      const adminId = await AsyncStorage.getItem('userId');
      await axios.patch(`${API_URL}/api/reports/${reportId}/action`, {
        action,
        adminId,
      });
      Alert.alert('완료', `신고 ${action === 'ban' ? '정지' : '무시'} 처리 완료`);
      setModalVisible(false);
      fetchReports();
    } catch (err) {
      Alert.alert('오류', '처리 실패');
      console.error(err);
    }
  };

  const openDetailModal = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openDetailModal(item)}>
      <Text style={styles.title}>신고자: {item.reporterId}</Text>
      <Text>피신고자: {item.reportedUserId}</Text>
      <Text>사유: {item.reason}</Text>
      <Text>상태: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚨 신고 내역 관리</Text>
      {loading ? <Text>불러오는 중...</Text> : <FlatList data={reports} keyExtractor={(item) => item.id} renderItem={renderItem} />}

      {/* 신고 상세 모달 */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReport && (
              <>
                <Text style={styles.modalTitle}>신고 상세</Text>
                <Text>신고자: {selectedReport.reporterId}</Text>
                <Text>피신고자: {selectedReport.reportedUserId}</Text>
                <Text>사유: {selectedReport.reason}</Text>
                <Text>상태: {selectedReport.status}</Text>
                {selectedReport.status === 'pending' && (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.banBtn} onPress={() => handleAction(selectedReport.id, selectedReport.reportedUserId, 'ban')}>
                      <Text style={styles.btnText}>유저 정지</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ignoreBtn} onPress={() => handleAction(selectedReport.id, selectedReport.reportedUserId, 'ignore')}>
                      <Text style={styles.btnText}>무시</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 20 }}>
                  <Text style={{ color: 'gray' }}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminReports;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#f9f9f9', padding: 10, marginVertical: 6, borderRadius: 8 },
  title: { fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-around' },
  banBtn: { backgroundColor: 'red', padding: 10, borderRadius: 6 },
  ignoreBtn: { backgroundColor: 'gray', padding: 10, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});
