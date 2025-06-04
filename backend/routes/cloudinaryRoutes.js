const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/delete-image', async (req, res) => {
	const { public_id } = req.body;

	if (!public_id) {
		return res.status(400).json({ error: 'public_id 누락됨' });
	}

	try {
		const result = await cloudinary.uploader.destroy(public_id);
		res.json({ success: true, result });
	} catch (err) {
		console.error('Cloudinary 삭제 오류:', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

module.exports = router;
