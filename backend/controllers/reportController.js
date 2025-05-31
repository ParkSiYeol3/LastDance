// backend/controllers/reportController.js
const { db } = require('../firebase/firebase'); // 정확한 상대경로 사용
const { Timestamp } = require('firebase-admin/firestore'); // 날짜 포맷용

exports.createReport = async (req, res) => {
  const { reporterId, reportedUserId, reason } = req.body;

  if (!reporterId || !reportedUserId || !reason) {
    return res.status(400).json({ error: '필수 항목 누락' });
  }

  try {
    const docRef = await db.collection('reports').add({
      reporterId,
      reportedUserId,
      reason,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    res.status(201).json({ id: docRef.id, message: '신고가 접수되었습니다' });
  } catch (err) {
    console.error('신고 저장 실패:', err);
    res.status(500).json({ error: '신고 저장 실패' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reports);
  } catch (err) {
    console.error('신고 목록 불러오기 실패:', err);
    res.status(500).json({ error: '신고 목록 불러오기 실패' });
  }
};

exports.processReport = async (req, res) => {
  const { id } = req.params;
  const { action, adminId } = req.body;

  try {
    const reportRef = db.collection('reports').doc(id);
    const reportSnap = await reportRef.get();

    if (!reportSnap.exists) {
      return res.status(404).json({ error: '신고 내역 없음' });
    }

    const reportedUserId = reportSnap.data().reportedUserId;

    if (action === 'ban') {
      await db.collection('users').doc(reportedUserId).update({ status: 'banned' });
      await reportRef.update({
        status: 'banned',
        reviewedBy: adminId,
        reviewedAt: Timestamp.now(),
      });
    } else if (action === 'ignore') {
      await reportRef.update({
        status: 'ignored',
        reviewedBy: adminId,
        reviewedAt: Timestamp.now(),
      });
    } else {
      return res.status(400).json({ error: '잘못된 action 값' });
    }

    res.json({ message: '신고 처리 완료' });
  } catch (err) {
    console.error('신고 처리 실패:', err);
    res.status(500).json({ error: '신고 처리 실패' });
  }
};