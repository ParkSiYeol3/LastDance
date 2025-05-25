# 👕 Cloth Stain Detection with YOLOv8

YOLOv8을 기반으로 한 의류 얼룩 탐지 모델입니다.  
color 얼룩, hole (찢어짐), thread (실밥 튀어나옴) 세 가지 클래스를 분류/탐지합니다.

---

## 📂 프로젝트 구조

cloth-stain-detection/
├── train.py # 학습 전체 파이프라인
├── merge_data.py # data3 + data4 병합
├── val.py # mAP 등 정량 평가
├── predict.py # 임의 이미지로 추론
├── data/
│ └── data.yaml # 클래스 및 경로 정의
├── notebooks/
│ └── colab_full.ipynb # 전체 실험 기록 (선택)
├── requirements.txt # 설치 패키지 목록
└── README.md # 설명 파일


---

## 🚀 설치 방법

```bash
git clone https://github.com/your-username/cloth-stain-detection.git
cd cloth-stain-detection
pip install -r requirements.txt

-----------------------------------

 ## 데이터 구성
YOLO 포맷(images/, labels/)으로 구성된 데이터셋을 사용합니다.
data3와 data4를 병합하여 data6을 생성합니다.

python merge_data.py

-------------------------
## 모델 학습

python train.py --model best5.pt --data data/data.yaml --epochs 50 --run_name best6_finetuned
결과는 runs/detect/best6_finetuned/weights/best.pt에 저장됩니다.

-------------------------

## 모델 평가

python val.py --model best6.pt --data data/data.yaml

-------------------------

## 이미지 추론

python predict.py --model best6.pt --image test_images/your_image.jpg

--------------------------


| 클래스      | AP\@0.5 | AP\@0.5:0.95 |
| -------- | ------- | ------------ |
| `color`  | 0.670   | 0.398        |
| `hole`   | 0.706   | 0.460        |
| `thread` | 0.525   | 0.292        |

전체 mAP@0.5: 0.634
---------------------------

## 프로젝트 소개

이 프로젝트는 P2P 의류 대여 플랫폼의 반납 검수 자동화 기능으로 개발되었습니다.

얼룩이 있는지 자동 판별하여 신뢰도 기반 반납 처리를 돕습니다.

---------------------------