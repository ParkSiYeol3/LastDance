const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const itemRoutes = require('./routes/itemRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 🌐 CORS & JSON 파싱
app.use(cors());
app.use(express.json());

// 📁 정적 파일 제공 (예: public/index.html 등)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ API 라우트 연결
app.use('/api/items', itemRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/deposit', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// 🔎 테스트용 기본 라우트
app.get('/api/hello', (req, res) => {
	res.json({ message: 'Hello from unified backend!' });
});

// 🚀 서버 시작
app.listen(PORT, '0.0.0.0', () => {
	console.log(`✅ 서버가 http://0.0.0.0:${PORT} 에서 실행 중`);
});
