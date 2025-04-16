const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../firebase/admin'); // Firestore 연동

// 📦 보증금 결제 Intent 생성
exports.createPaymentIntent = async (req, res) => {
  const { amount, userId, rentalItemId } = req.body;

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
