const { admin, db } = require('../firebase/admin');

// 아이템 상세 조회
exports.getItemDetail = async (req, res) => {
	const { itemId } = req.params;
	try {
		const itemSnap = await db.collection('items').doc(itemId).get();
		if (!itemSnap.exists) {
			return res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
		}
		const item = itemSnap.data();

		const userSnap = await db.collection('users').doc(item.userId).get();
		const itemOwnerName = userSnap.exists ? userSnap.data().nickname : '등록자 정보 없음';

		res.json({ item, itemOwnerName });
	} catch (error) {
		console.error('아이템 로딩 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 상품 수정
exports.updateItem = async (req, res) => {
	const { itemId } = req.params;
	const { name, description, imageURLs } = req.body;

	try {
		await db
			.collection('items')
			.doc(itemId)
			.update({
				name,
				description,
				imageURLs: imageURLs || [], // imageURLs만 사용
			});
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

		const comments = await Promise.all(
			snap.docs.map(async (doc) => {
				const data = doc.data();
				const userSnap = await db.collection('users').doc(data.userId).get();
				const nickname = userSnap.exists ? userSnap.data().nickname : '익명';
				return {
					id: doc.id,
					...data,
					nickname,
				};
			})
		);

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

		const rentals = snap.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		res.json({ rentals });
	} catch (error) {
		console.error('대여 기록 조회 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 좋아요 추가
exports.likeItem = async (req, res) => {
	const { itemId } = req.params;
	const { userId } = req.body;
	try {
		await db.collection('likes').doc(`${itemId}_${userId}`).set({
			itemId,
			userId,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
		});
		res.status(200).json({ success: true });
	} catch (err) {
		console.error('좋아요 추가 실패:', err);
		res.status(500).json({ error: '좋아요 추가 실패' });
	}
};

// 좋아요 삭제
exports.unlikeItem = async (req, res) => {
	const { itemId } = req.params;
	const { userId } = req.body;
	try {
		await db.collection('likes').doc(`${itemId}_${userId}`).delete();
		res.status(200).json({ success: true });
	} catch (err) {
		console.error('좋아요 삭제 실패:', err);
		res.status(500).json({ error: '좋아요 삭제 실패' });
	}
};

// 찜 추가
exports.bookmarkItem = async (req, res) => {
	const { itemId } = req.params;
	const { userId } = req.body;
	try {
		await db.collection('bookmarks').doc(`${itemId}_${userId}`).set({
			itemId,
			userId,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
		});
		res.status(200).json({ success: true });
	} catch (err) {
		console.error('찜 추가 실패:', err);
		res.status(500).json({ error: '찜 추가 실패' });
	}
};

// 찜 삭제
exports.unbookmarkItem = async (req, res) => {
	const { itemId } = req.params;
	const { userId } = req.body;
	try {
		await db.collection('bookmarks').doc(`${itemId}_${userId}`).delete();
		res.status(200).json({ success: true });
	} catch (err) {
		console.error('찜 삭제 실패:', err);
		res.status(500).json({ error: '찜 삭제 실패' });
	}
};

// 좋아요 & 찜 상태 조회
exports.getItemStatus = async (req, res) => {
	const { itemId } = req.params;
	const { userId } = req.query;
	try {
		const likeDoc = await db.collection('likes').doc(`${itemId}_${userId}`).get();
		const bookmarkDoc = await db.collection('bookmarks').doc(`${itemId}_${userId}`).get();
		res.status(200).json({
			liked: likeDoc.exists,
			bookmarked: bookmarkDoc.exists,
		});
	} catch (err) {
		console.error('상태 조회 실패:', err);
		res.status(500).json({ error: '상태 조회 실패' });
	}
};
