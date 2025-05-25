# val.py
from ultralytics import YOLO
import argparse

def evaluate_model(model_path, data_yaml):
    model = YOLO(model_path)

    metrics = model.val(data=data_yaml)

    print("\n📊 [전체 성능 지표]")
    print(f"Precision (mean):     {metrics.box.mp:.3f}")
    print(f"Recall (mean):        {metrics.box.mr:.3f}")
    print(f"mAP@0.5:              {metrics.box.map50:.3f}")
    print(f"mAP@0.5:0.95 (mean):  {metrics.box.map:.3f}")

    print("\n📌 [클래스별 AP 점수]")
    for i in range(len(metrics.box.ap50)):
        ap50 = metrics.box.ap50[i]
        ap95 = metrics.box.ap[i]
        print(f"- Class {i}: AP@0.5 = {ap50:.3f}, AP@0.5:0.95 = {ap95:.3f}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=str, default='best6.pt', help='YOLO 모델 경로 (.pt)')
    parser.add_argument('--data', type=str, default='data/data.yaml', help='YOLO 데이터 설정 파일')

    args = parser.parse_args()

    evaluate_model(args.model, args.data)
