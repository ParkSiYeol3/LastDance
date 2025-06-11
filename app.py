from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import logging

app = Flask(__name__)
CORS(app)  # 모든 도메인 허용

# 로그 수준 설정 (디버깅에 도움)
logging.basicConfig(level=logging.INFO)

# YOLOv8 모델 로드
try:
    model = YOLO("models/best.pt")
    print("✅ 모델 로드 완료")
except Exception as e:
    print("❌ 모델 로드 실패:", e)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    try:
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read()))

        # 예측 실행
        results = model.predict(img)

        # 박스 정보 추출
        boxes = results[0].boxes
        output = []
        for box in boxes:
            cls = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()
            output.append({
                'class_id': cls,
                'confidence': conf,
                'box': xyxy
            })

        return jsonify({'predictions': output})
    except Exception as e:
        app.logger.error(f"❌ 예측 실패: {e}")
        return jsonify({'error': f'서버 처리 중 오류 발생: {str(e)}'}), 500

if __name__ == '__main__':
    # 포트 8082로 실행 (React Native 앱에서 연결할 포트)
    app.run(host='0.0.0.0', port=8082)
