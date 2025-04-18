const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 🌐 CORS & JSON 파싱
app.use(cors());
app.use(express.json());

// 📁 정적 파일 제공 (예: public/index.html 등)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 기존 index.js 기능 통합
app.use('/api/deposit', paymentRoutes);
app.use('/api/chat', chatRoutes);

// 🔎 테스트용 기본 라우트
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from unified backend!' });
});

// 🚀 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중`);
});
