# merge_data.py
import os
import shutil
from glob import glob

def copy_all(src_folder, dst_folder):
    """폴더 내 모든 파일을 다른 폴더로 복사"""
    os.makedirs(dst_folder, exist_ok=True)
    for file in glob(os.path.join(src_folder, '*')):
        fname = os.path.basename(file)
        shutil.copy(file, os.path.join(dst_folder, fname))

def merge_datasets(data3_path, data4_path, merged_path):
    # 하위 폴더 생성
    for split in ['train/images', 'train/labels', 'valid/images', 'valid/labels']:
        os.makedirs(os.path.join(merged_path, split), exist_ok=True)

    print("📦 데이터 복사 중...")

    # data3 복사
    copy_all(f'{data3_path}/train/images', f'{merged_path}/train/images')
    copy_all(f'{data3_path}/train/labels', f'{merged_path}/train/labels')
    copy_all(f'{data3_path}/valid/images', f'{merged_path}/valid/images')
    copy_all(f'{data3_path}/valid/labels', f'{merged_path}/valid/labels')

    # data4 복사
    copy_all(f'{data4_path}/train/images', f'{merged_path}/train/images')
    copy_all(f'{data4_path}/train/labels', f'{merged_path}/train/labels')
    copy_all(f'{data4_path}/valid/images', f'{merged_path}/valid/images')
    copy_all(f'{data4_path}/valid/labels', f'{merged_path}/valid/labels')

    print("✅ 데이터 병합 완료! →", merged_path)

if __name__ == '__main__':
    data3_path = 'data3.yolov5pytorch'
    data4_path = 'data4.yolov5pytorch'
    merged_path = 'data6.yolov5pytorch'

    merge_datasets(data3_path, data4_path, merged_path)
