// utils/formatTimestamp.js
export const formatTimestamp = (ts) => {
	if (!ts || !ts._seconds) return '';

	const date = new Date(ts._seconds * 1000); // Firestore timestamp → JS Date

	const year = date.getFullYear();
	const month = `0${date.getMonth() + 1}`.slice(-2); // 0~11이므로 +1
	const day = `0${date.getDate()}`.slice(-2);

	const hours = `0${date.getHours()}`.slice(-2);
	const minutes = `0${date.getMinutes()}`.slice(-2);

	return `${year}-${month}-${day} ${hours}:${minutes}`;
};
