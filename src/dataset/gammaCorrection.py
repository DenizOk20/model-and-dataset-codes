import cv2
import numpy as np
import os
import shutil  # Label dosyalarını kopyalamak için

def gamma_correction(image_path, gamma=1.5):
    """Gamma düzeltme uygular"""
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    image_gamma = np.power(image / 255.0, gamma) * 255.0
    return np.uint8(image_gamma)

def process_images_and_labels(image_folder, label_folder, output_image_folder, output_label_folder, gamma=1.5):
    """Görüntülere gamma düzeltme uygular ve label dosyalarını kopyalar"""
    
    if not os.path.exists(output_image_folder):
        os.makedirs(output_image_folder)  # Klasör yoksa oluştur
    if not os.path.exists(output_label_folder):
        os.makedirs(output_label_folder)

    for filename in os.listdir(image_folder):
        if filename.endswith(('.jpg', '.png', '.jpeg')):
            input_image_path = os.path.join(image_folder, filename)
            output_image_path = os.path.join(output_image_folder, filename)

            processed_image = gamma_correction(input_image_path, gamma)

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
     "/content/drive/MyDrive/dataset_gamma/train/images",
     "/content/drive/MyDrive/dataset_gamma/train/labels"),
    
    ("/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/valid/images",
     "/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/valid/labels",
     "/content/drive/MyDrive/dataset_gamma/valid/images",
     "/content/drive/MyDrive/dataset_gamma/valid/labels"),
    
    ("/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/test/images",
     "/content/drive/MyDrive/Merged_Brain_Tumor_Dataset_with_types_last/test/labels",
     "/content/drive/MyDrive/dataset_gamma/test/images",
     "/content/drive/MyDrive/dataset_gamma/test/labels")
]

# Gamma düzeltmeyi uygula ve label dosyalarını kopyala
for img_dir, lbl_dir, out_img_dir, out_lbl_dir in dataset_dirs:
    process_images_and_labels(img_dir, lbl_dir, out_img_dir, out_lbl_dir, gamma=1.5)

print("Tüm görüntüler işlendi ve label dosyaları kopyalandı!")
