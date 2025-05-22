import cv2
import numpy as np
import os
import shutil  # Label dosyalarını kopyalamak için

def clahe_enhancement(image_path, clip_limit=2.0, tile_grid_size=(8,8)):
    """CLAHE (Contrast Limited Adaptive Histogram Equalization) uygular"""
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # CLAHE objesi oluştur
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    
    # CLAHE uygula
    image_clahe = clahe.apply(image)
    
    return image_clahe

def process_images_and_labels(image_folder, label_folder, output_image_folder, output_label_folder, clip_limit=2.0):
    """Görüntülere CLAHE uygular ve label dosyalarını kopyalar"""
    
    if not os.path.exists(output_image_folder):
        os.makedirs(output_image_folder)  # Klasör yoksa oluştur
    if not os.path.exists(output_label_folder):
        os.makedirs(output_label_folder)
        
    for filename in os.listdir(image_folder):
        if filename.endswith(('.jpg', '.png', '.jpeg')):
            input_image_path = os.path.join(image_folder, filename)
            output_image_path = os.path.join(output_image_folder, filename)
            
            processed_image = clahe_enhancement(input_image_path, clip_limit)
            
            # Çıkış klasörünün var olup olmadığını kontrol et ve oluştur
            os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
            cv2.imwrite(output_image_path, processed_image)
            
            # Label dosyasının aynı isimli olanını kopyala
            label_filename = os.path.splitext(filename)[0] + ".txt"
            input_label_path = os.path.join(label_folder, label_filename)
            output_label_path = os.path.join(output_label_folder, label_filename)
            
            if os.path.exists(input_label_path):  # Eğer label dosyası varsa kopyala
                shutil.copy(input_label_path, output_label_path)
            
            print(f"Processed: {output_image_path} | Label Copied: {output_label_path}")

# Klasörleri tanımla
dataset_dirs = [
    ("/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/train/images",
     "/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/train/labels",
     "/content/drive/MyDrive/dataset_clahe/train/images",
     "/content/drive/MyDrive/dataset_clahe/train/labels"),
    
    ("/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/valid/images",
     "/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/valid/labels",
     "/content/drive/MyDrive/dataset_clahe/valid/images",
     "/content/drive/MyDrive/dataset_clahe/valid/labels"),
    
    ("/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/test/images",
     "/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/test/labels",
     "/content/drive/MyDrive/dataset_clahe/test/images",
     "/content/drive/MyDrive/dataset_clahe/test/labels")
]

# CLAHE filtresini uygula ve label dosyalarını kopyala
for img_dir, lbl_dir, out_img_dir, out_lbl_dir in dataset_dirs:
    process_images_and_labels(img_dir, lbl_dir, out_img_dir, out_lbl_dir, clip_limit=2.0)

print("Tüm görüntüler CLAHE ile işlendi ve label dosyaları kopyalandı!")