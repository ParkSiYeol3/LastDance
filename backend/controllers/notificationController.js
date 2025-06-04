const { admin, db } = require('../firebase/admin');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.sendNotification = async (req, res) => {
   const { userId, title, message } = req.body;

   console.log('📩 [1] 알림 요청 도착:', { userId, title, message });

   try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
         console.log('⚠️ [2] 유저 문서 없음:', userId);
         return res.status(404).json({ error: '사용자 문서를 찾을 수 없습니다.' });
      }

      const userData = userDoc.data();
      console.log('✅ [3] 유저 데이터:', userData);

      if (!userData?.pushToken) {
         console.log('❌ [4] pushToken 없음');
         return res.status(400).json({ error: '사용자의 pushToken이 없습니다.' });
      }

      const pushToken = userData.pushToken;
      console.log('📲 [5] PushToken:', pushToken);

      // Expo로 푸시 전송
      const payload = {
         to: pushToken,
         sound: 'default',
         title,
         body: message,
      };
      console.log('📦 [6] 전송할 Payload:', payload);

      const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
         method: 'POST',
         headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(payload),
      });

      const result = await expoRes.json();
      console.log('📤 [7] Expo 응답:', result);

      if (result.errors) {
         console.error('🚫 [8] Expo 오류 발생:', result.errors);
         return res.status(500).json({ error: 'Expo 전송 실패', details: result.errors });
      }

      console.log('✅ [9] 알림 전송 완료');
      res.status(200).json({ success: true, result });
   } catch (err) {
      console.error('❌ [10] 예외 발생:', err);
      res.status(500).json({ error: '푸시 전송 실패', details: err.message });
   }
};
