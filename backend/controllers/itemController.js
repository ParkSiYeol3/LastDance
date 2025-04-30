// controllers/itemController.js
const { admin, db } = require('../firebase/admin'); // db는 admin.firestore() 인스턴스입니다.

// 아이템 상세 조회
exports.getItemDetail = async (req, res) => {
	const { itemId } = req.params;
	try {
		const itemSnap = await db.collection('items').doc(itemId).get();
		if (!itemSnap.exists) {
			return res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
		}
		const item = itemSnap.data();

		// users 컬렉션에서 nickname 가져오기
		const userSnap = await db.collection('users').doc(item.userId).get();
		const itemOwnerName = userSnap.exists ? userSnap.data().nickname : '등록자 정보 없음';

		// item + itemOwnerName 을 같이 응답
		res.json({ item, itemOwnerName });
	} catch (error) {
		console.error('아이템 로딩 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 상품 수정
exports.updateItem = async (req, res) => {
	const { itemId } = req.params;
	const { name, description, imageURL } = req.body;
	try {
		await db
			.collection('items')
			.doc(itemId)
			.update({ name, description, imageURL: imageURL || null });
		res.json({ message: '상품 수정 완료' });
	} catch (error) {
		console.error('상품 수정 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 상품 삭제
exports.deleteItem = async (req, res) => {
	const { itemId } = req.params;
	try {
		await db.collection('items').doc(itemId).delete();
		res.json({ message: '상품 삭제 완료' });
	} catch (error) {
		console.error('상품 삭제 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 대여 요청
exports.requestRental = async (req, res) => {
	const { itemId } = req.params;
	const { requesterId, ownerId } = req.body;
	try {
		await db.collection('rentals').add({
			itemId,
			requesterId,
			ownerId,
			status: 'pending',
			timestamp: admin.firestore.FieldValue.serverTimestamp(),
		});
		res.json({ message: '대여 요청 완료' });
	} catch (error) {
		console.error('대여 요청 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 대여 확정
exports.confirmRental = async (req, res) => {
	const { rentalId } = req.params;
	try {
		await db.collection('rentals').doc(rentalId).update({ status: 'confirmed' });
		res.json({ message: '대여 확정 완료' });
	} catch (error) {
		console.error('대여 확정 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 댓글 조회
exports.getComments = async (req, res) => {
	const { itemId } = req.params;
	try {
		const snap = await db.collection('comments').where('itemId', '==', itemId).orderBy('timestamp', 'asc').get();
		const comments = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		res.json({ comments });
	} catch (error) {
		console.error('댓글 조회 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 댓글 작성
exports.addComment = async (req, res) => {
	const { itemId } = req.params;
	const { userId, text } = req.body;
	try {
		await db.collection('comments').add({
			itemId,
			userId,
			text,
			timestamp: admin.firestore.FieldValue.serverTimestamp(),
		});
		res.json({ message: '댓글 작성 완료' });
	} catch (error) {
		console.error('댓글 작성 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 대여 이력 조회
exports.getRentalHistory = async (req, res) => {
	const { itemId } = req.params;
	try {
		const snap = await db.collection('rentals').where('itemId', '==', itemId).orderBy('timestamp', 'desc').get();
		const rentals = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		res.json({ rentals });
	} catch (error) {
		console.error('대여 기록 조회 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};
