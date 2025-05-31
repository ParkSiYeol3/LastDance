const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../firebase/admin'); // Firestore 연동
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// 📦 보증금 결제 Intent 생성
exports.createPaymentIntent = async (req, res) => {
  const { amount, rentalItemId } = req.body;
  const userId = req.user?.uid || req.body.userId; // ✅ 자동 UID 또는 수동 입력

  if (!amount || !userId || !rentalItemId) {
    return res.status(400).json({ error: 'amount, userId, rentalItemId는 필수입니다.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'krw',
      payment_method_types: ['card'],
      metadata: {
        userId,
        rentalItemId,
      },
    });

    await db.collection('payments').add({
      userId,
      rentalItemId,
      amount,
      paymentIntentId: paymentIntent.id,
      status: 'created',
      createdAt: new Date(),
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('❌ 결제 Intent 생성 오류:', err);
    res.status(500).json({ error: err.message });
  }
};

// 💸 환불 처리
exports.confirmRefund = async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({ error: 'paymentIntentId가 필요합니다.' });
  }

  try {
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });

    const snapshot = await db
      .collection('payments')
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await doc.ref.update({
        status: 'refunded',
        refundedAt: new Date(),
        refundId: refund.id,
      });
    }

    res.json({ refund });
  } catch (err) {
    console.error('❌ 환불 처리 오류:', err);
    res.status(500).json({ error: err.message });
  }
};

// 📄 사용자 결제 내역 조회
exports.getUserPayments = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId가 필요합니다.' });
  }

  try {
    const snapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const payments = [];
    snapshot.forEach(doc => {
      payments.push({ id: doc.id, ...doc.data() });
    });

    res.json({ payments });
  } catch (error) {
    console.error('❌ 거래 내역 조회 에러:', error.message);
    res.status(500).json({ error: error.message });
  }
};
// 자동 반환 
exports.autoRefundByItem = async (req, res) => {
  const userId = req.user?.uid || req.body.userId; // ✅ 누락된 부분 복구
  const { rentalItemId } = req.body;

  if (!userId || !rentalItemId) {
    return res.status(400).json({ error: 'userId와 rentalItemId가 필요합니다.' });
  }

  try {
    const snapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .where('rentalItemId', '==', rentalItemId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: '해당 결제 내역을 찾을 수 없습니다.' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const refund = await stripe.refunds.create({
      payment_intent: data.paymentIntentId,
    });

    await doc.ref.update({
      status: 'refunded',
      refundedAt: new Date(),
      refundId: refund.id,
    });

    res.json({ message: '보증금 반환 성공', refund });
  } catch (err) {
    console.error('❌ 자동 반환 오류:', err.message);
    res.status(500).json({ error: err.message });
  }
};
// 🟢 보증금 결제 상태 조회
exports.getPaymentStatus = async (req, res) => {
  const { userId, rentalItemId } = req.query;

  if (!userId || !rentalItemId) {
    return res.status(400).json({ error: 'userId와 rentalItemId가 필요합니다.' });
  }

  try {
    const snapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .where('rentalItemId', '==', rentalItemId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({ status: 'none' }); // 결제 이력이 없음
    }

    const payment = snapshot.docs[0].data();
    res.json({ status: payment.status || 'created' });
  } catch (err) {
    console.error('❌ 결제 상태 조회 실패:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  const { paymentIntentId, userId, rentalItemId } = req.body;

  // 1) 필수 파라미터 검증
  if (!paymentIntentId || !userId || !rentalItemId) {
    return res.status(400).json({ 
      error: 'paymentIntentId, userId, rentalItemId는 필수입니다.' 
    });
  }

  try {
    // 2) Stripe API로 실제 결제 상태 조회 (옵션이지만 안전)
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: '해당 결제는 아직 완료되지 않았거나 실패 상태입니다.' 
      });
    }

    // 3) Firestore에서 해당 paymentIntentId를 가진 결제 문서 찾기
    const snapshot = await db.collection('payments')
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        error: '해당 paymentIntentId를 가진 결제 내역을 찾을 수 없습니다.' 
      });
    }

    // 4) 문서가 이미 succeeded 되어 있지 않다면 업데이트
    const paymentDocRef = snapshot.docs[0].ref;
    const paymentData = snapshot.docs[0].data();

    if (paymentData.status === 'succeeded') {
      // 이미 업데이트된 경우라면 그대로 성공 응답
      return res.json({ success: true, message: '이미 succeeded 상태입니다.' });
    }

    // 5) Firestore 문서 업데이트
    await paymentDocRef.update({ status: 'succeeded', succeededAt: new Date() });

    // (선택) 일부러 chatRooms 컬렉션에도 상태를 기록해야 한다면 여기에 추가 로직을 넣으세요
     await db.collection('chatRooms').doc(roomId).update({ paymentStatus: 'succeeded' });

    return res.json({ success: true });
  } catch (err) {
    console.error('결제 완료 처리 오류:', err);
    return res.status(500).json({ error: '결제 완료 처리 중 서버 오류가 발생했습니다.' });
  }
};
