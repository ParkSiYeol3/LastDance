const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');

const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 🌐 CORS & JSON 파싱
app.use(cors());
app.use(express.json());

// 📁 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 기존 기능 통합
app.use('/api/deposit', paymentRoutes);
app.use('/api/chat', chatRoutes);

// 🔎 테스트용 기본 라우트
app.get('/api/hello', (req, res) => {
	res.json({ message: 'Hello from unified backend!' });
});

// ✉️ 이메일 발송 라우트 추가
app.post('/send-email', async (req, res) => {
	const { to, subject, text } = req.body;

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: '지메일@gmail.com', // 네 지메일
			pass: '앱 비밀번호', // 네 앱 비밀번호
		},
	});

	try {
		await transporter.sendMail({
			from: '지메일일@gmail.com',
			to,
			subject,
			text,
		});
		res.send('이메일 발송 성공!');
	} catch (error) {
		console.error(error);
		res.status(500).send('이메일 발송 실패');
	}
});

// 🚀 서버 시작
app.listen(PORT, () => {
	console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중`);
});
