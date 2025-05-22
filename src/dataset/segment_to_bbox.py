import os
import glob
from PIL import Image

# Segment → Box dönüştürücü
def segment_to_yolo_bbox(segment, img_width, img_height):
    x_coords = segment[::2]
    y_coords = segment[1::2]
    x_min, x_max = min(x_coords), max(x_coords)
    y_min, y_max = min(y_coords), max(y_coords)

    x_center = (x_min + x_max) / 2 / img_width
    y_center = (y_min + y_max) / 2 / img_height
    width = (x_max - x_min) / img_width
    height = (y_max - y_min) / img_height

    return x_center, y_center, width, height

# Dataset yolunu belirt
base_path = "/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types"
sets = ["train", "valid", "test"]

for set_name in sets:
    label_dir = os.path.join(base_path, set_name, "labels")
    image_dir = os.path.join(base_path, set_name, "images")

    for label_path in glob.glob(os.path.join(label_dir, "*.txt")):
        image_name = os.path.basename(label_path).replace(".txt", ".jpg")  # veya .png
        image_path = os.path.join(image_dir, image_name)
        if not os.path.exists(image_path):
            print(f"Görsel bulunamadı: {image_path}")
            continue

        img = Image.open(image_path)
        img_w, img_h = img.size

        new_lines = []
        with open(label_path, "r") as f:
            lines = f.readlines()

        for line in lines:
            parts = line.strip().split()
            class_id = parts[0]
            values = list(map(float, parts[1:]))

            if len(values) == 4:
                # Zaten YOLO kutusu varsa, aynen bırak
                new_lines.append(line.strip())
            elif len(values) > 4:
                # Segment varsa → kutuya çevir
                bbox = segment_to_yolo_bbox(values, img_w, img_h)
                new_line = f"{class_id} {' '.join(f'{v:.6f}' for v in bbox)}"
                new_lines.append(new_line)
            else:
                print(f"Beklenmeyen format: {label_path} → {line}")

        # Dosyayı yeni bounding box içeriğiyle güncelle
        with open(label_path, "w") as f:
            f.write("\n".join(new_lines))
