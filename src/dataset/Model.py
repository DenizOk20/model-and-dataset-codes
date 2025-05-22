!pip install torch torchvision torchaudio
!pip install ultralytics

import torch
from ultralytics import YOLO

data_yaml = '/content/drive/MyDrive/BrainTumorYolov8/YOLOv8_TumorDataset/data.yaml'
train_path = '/content/drive/MyDrive/BrainTumorYolov8/YOLOv8_TumorDataset/train'
val_path = '/content/drive/MyDrive/BrainTumorYolov8/YOLOv8_TumorDataset/valid'
test_path = '/content/drive/MyDrive/BrainTumorYolov8/YOLOv8_TumorDataset/test'

model = YOLO('yolov8n.pt')

results = model.train(
    data=data_yaml,
    epochs=50,
    imgsz=640,
    augment=True,
    degrees=45,
    translate=0.2,
    scale=0.5,
    lr0=0.01,
    lrf=0.1,
    weight_decay=0.0005,
    dropout=0.2,
    label_smoothing=0.1
)

metrics = model.val(data=data_yaml)
