const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../firebase/admin'); // Firestore 연동

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
  const { userId, rentalItemId } = req.body;
//const userId = req.user?.uid;   //firebase 인증 토큰에서 UID 가져오기(프론트디자인 끝나면 적용) // auth 토큰 가져와야함 //자동 uid  위함 

  if (!userId || !rentalItemId) {
    return res.status(400).json({ error: 'userId와 rentalItemId가 필요합니다.' });
  }

  try {
    // 1️⃣ 해당 조건으로 가장 최근 결제 찾기
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

    // 2️⃣ Stripe 환불 실행
    const refund = await stripe.refunds.create({
      payment_intent: data.paymentIntentId,
    });

    // 3️⃣ Firestore 상태 업데이트
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