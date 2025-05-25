# predict.py
from ultralytics import YOLO
from PIL import Image
import argparse
import glob
import os

def predict_image(model_path, image_path, save_dir='runs/predict'):

    model = YOLO(model_path)

    # 추론 실행
    results = model.predict(source=image_path, save=True, save_txt=True, project=save_dir, name='result')

    # 추론 결과 이미지 파일 자동 탐색
    result_path = glob.glob(os.path.join(save_dir, 'result', '*.jpg'))[-1]
    print(f"\n🖼️ 결과 이미지 경로: {result_path}")

    # 이미지 열어서 시각화
    img = Image.open(result_path)
    img.show()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=str, default='best6.pt', help='YOLO 모델 경로 (.pt)')
    parser.add_argument('--image', type=str, required=True, help='테스트할 이미지 경로')

    args = parser.parse_args()

    predict_image(args.model, args.image)
