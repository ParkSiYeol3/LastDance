# train.py
from ultralytics import YOLO
import argparse
import os
import shutil

def train_model(model_path, data_yaml, epochs=50, imgsz=640, batch=8, run_name='cloth_stain_detector'):

    # 모델 불러오기
    model = YOLO(model_path)

    # 학습 실행
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        name=run_name
    )

    # 학습된 best.pt를 저장
    weights_dir = f'runs/detect/{run_name}/weights/best.pt'
    output_path = f'./best6.pt'
    if os.path.exists(weights_dir):
        shutil.copy(weights_dir, output_path)
        print(f"✅ best.pt 저장 완료: {output_path}")
    else:
        print("❌ best.pt 파일을 찾을 수 없습니다.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=str, default='yolov8m.pt', help='기존 모델 경로 (.pt)')
    parser.add_argument('--data', type=str, default='data/data.yaml', help='YOLO data.yaml 경로')
    parser.add_argument('--epochs', type=int, default=50)
    parser.add_argument('--imgsz', type=int, default=640)
    parser.add_argument('--batch', type=int, default=8)
    parser.add_argument('--run_name', type=str, default='cloth_stain_detector')

    opt = parser.parse_args()

    train_model(
        model_path=opt.model,
        data_yaml=opt.data,
        epochs=opt.epochs,
        imgsz=opt.imgsz,
        batch=opt.batch,
        run_name=opt.run_name
    )
