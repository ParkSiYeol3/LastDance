// 기본 지도 초기화
function initMap() {
	// 서울의 좌표를 기준으로 지도 중심 설정
	const center = { lat: 37.5665, lng: 126.978 }; // 서울 기준

	// 지도 객체 생성
	const map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: center,
	});

	// 샘플 마커 추가
	new google.maps.Marker({
		position: center,
		map: map,
		title: '여기서 만나요!', // 마커의 제목
	});
}

// 페이지 로드 후 initMap 함수 호출
window.onload = function () {
	// Google Maps API가 로드된 경우에만 지도 초기화
	if (typeof google !== 'undefined' && google.maps) {
		initMap();
	} else {
		console.error('Google Maps API 로드 실패');
	}
};
