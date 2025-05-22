import React, { useState } from 'react';
import './App.css';

// Statik kod gösterimi için CodeDisplay componentini güncelledik
const CodeDisplay = ({ code }) => (
  <pre className="code-preview">
    <code>{code}</code>
  </pre>
);

function App() {
  const [activeSection, setActiveSection] = useState('model');
  const [showCode, setShowCode] = useState({});

  const datasetFiles = [
    {
      name: 'Segment to Bounding Box',
      file: 'segment_to_bbox.py',
      desc: "Segment formatından bounding box'a çeviren kod.",
      code: `import os
import glob
from PIL import Image

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
                new_lines.append(line.strip())
            elif len(values) > 4:
                # Segment varsa → kutuya çevir
                bbox = segment_to_yolo_bbox(values, img_w, img_h)
                new_line = f"{class_id} {' '.join(f'{v:.6f}' for v in bbox)}"
                new_lines.append(new_line)
            else:
                print(f"Beklenmeyen format: {label_path} → {line}")

        with open(label_path, "w") as f:
            f.write("\n".join(new_lines))
`
    },
    {
      name: 'CLAHE Filter',
      file: 'ClaheFiltre.py',
      desc: 'Görüntüye kontrast artırıcı CLAHE filtresi uygular.',
      code: `import cv2
import numpy as np
import os
import shutil  # Label dosyalarını kopyalamak için

def clahe_enhancement(image_path, clip_limit=2.0, tile_grid_size=(8,8)):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    
    image_clahe = clahe.apply(image)
    
    return image_clahe

def process_images_and_labels(image_folder, label_folder, output_image_folder, output_label_folder, clip_limit=2.0):
    
    if not os.path.exists(output_image_folder):
        os.makedirs(output_image_folder)  # Klasör yoksa oluştur
    if not os.path.exists(output_label_folder):
        os.makedirs(output_label_folder)
        
    for filename in os.listdir(image_folder):
        if filename.endswith(('.jpg', '.png', '.jpeg')):
            input_image_path = os.path.join(image_folder, filename)
            output_image_path = os.path.join(output_image_folder, filename)
            
            processed_image = clahe_enhancement(input_image_path, clip_limit)
            
            os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
            cv2.imwrite(output_image_path, processed_image)
            
            label_filename = os.path.splitext(filename)[0] + ".txt"
            input_label_path = os.path.join(label_folder, label_filename)
            output_label_path = os.path.join(output_label_folder, label_filename)
            
            if os.path.exists(input_label_path):  # Eğer label dosyası varsa kopyala
                shutil.copy(input_label_path, output_label_path)
            
            print(f"Processed: {output_image_path} | Label Copied: {output_label_path}")

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

for img_dir, lbl_dir, out_img_dir, out_lbl_dir in dataset_dirs:
    process_images_and_labels(img_dir, lbl_dir, out_img_dir, out_lbl_dir, clip_limit=2.0)

print("Tüm görüntüler CLAHE ile işlendi ve label dosyaları kopyalandı!")
`
    },
    {
      name: 'Gamma Correction',
      file: 'gammaCorrection.py',
      desc: 'Görüntüye gamma düzeltme uygular.',
      code: `import cv2
import numpy as np
import os
import shutil 

def gamma_correction(image_path, gamma=1.5):

    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    image_gamma = np.power(image / 255.0, gamma) * 255.0
    return np.uint8(image_gamma)

def process_images_and_labels(image_folder, label_folder, output_image_folder, output_label_folder, gamma=1.2):
    
    if not os.path.exists(output_image_folder):
        os.makedirs(output_image_folder)  # Klasör yoksa oluştur
    if not os.path.exists(output_label_folder):
        os.makedirs(output_label_folder)

    for filename in os.listdir(image_folder):
        if filename.endswith(('.jpg', '.png', '.jpeg')):
            input_image_path = os.path.join(image_folder, filename)
            output_image_path = os.path.join(output_image_folder, filename)

            processed_image = gamma_correction(input_image_path, gamma)

            os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
            cv2.imwrite(output_image_path, processed_image)

            label_filename = os.path.splitext(filename)[0] + ".txt"
            input_label_path = os.path.join(label_folder, label_filename)
            output_label_path = os.path.join(output_label_folder, label_filename)

            if os.path.exists(input_label_path):  # Eğer label dosyası varsa kopyala
                shutil.copy(input_label_path, output_label_path)
            
            print(f"Processed: {output_image_path} | Label Copied: {output_label_path}")

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

for img_dir, lbl_dir, out_img_dir, out_lbl_dir in dataset_dirs:
    process_images_and_labels(img_dir, lbl_dir, out_img_dir, out_lbl_dir, gamma=1.5)

print("Tüm görüntüler işlendi ve label dosyaları kopyalandı!")
`
    },
    {
      name: 'Merge Dataset',
      file: 'mergeDataset.py',
      desc: 'Farklı datasetleri birleştirir.',
      code: `import os
import shutil
import glob

def merge_datasets(source_path, target_path):
    
    folders = ['test', 'train', 'valid']
    sub_folders = ['images', 'labels']
    
    total_copied_files = 0
    
    print(f"Kaynak: {source_path}")
    print(f"Hedef: {target_path}")
    print("-" * 80)
    
    for folder in folders:
        source_folder_path = os.path.join(source_path, folder)
        target_folder_path = os.path.join(target_path, folder)
        
        if not os.path.exists(source_folder_path):
            print(f"UYARI: Kaynak klasör bulunamadı: {source_folder_path}")
            continue
        
        if not os.path.exists(target_folder_path):
            os.makedirs(target_folder_path)
            print(f"Oluşturulan klasör: {target_folder_path}")
        
        print(f"\nİşleniyor: {folder}/")
        
        for sub_folder in sub_folders:
            source_sub_path = os.path.join(source_folder_path, sub_folder)
            target_sub_path = os.path.join(target_folder_path, sub_folder)
            
            if not os.path.exists(source_sub_path):
                print(f"  UYARI: Alt klasör bulunamadı: {source_sub_path}")
                continue
                
            if not os.path.exists(target_sub_path):
                os.makedirs(target_sub_path)
                print(f"  Oluşturulan alt klasör: {target_sub_path}")
            
            if sub_folder == 'images':
                # Resim dosyaları için yaygın formatları ara
                extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff', '*.tif']
                files = []
                for ext in extensions:
                    files.extend(glob.glob(os.path.join(source_sub_path, ext)))
                    files.extend(glob.glob(os.path.join(source_sub_path, ext.upper())))
            else:
                # Label dosyaları için .txt ara
                files = glob.glob(os.path.join(source_sub_path, '*.txt'))
            
            copied_count = 0
            skipped_count = 0
            
            for file_path in files:
                file_name = os.path.basename(file_path)
                target_file_path = os.path.join(target_sub_path, file_name)
                
                if os.path.exists(target_file_path):
                    base_name, extension = os.path.splitext(file_name)
                    counter = 1
                    while os.path.exists(target_file_path):
                        new_name = f"{base_name}_{counter}{extension}"
                        target_file_path = os.path.join(target_sub_path, new_name)
                        counter += 1
                    print(f"    Yeniden adlandırıldı: {file_name} -> {os.path.basename(target_file_path)}")
                
                try:
                    shutil.copy2(file_path, target_file_path)
                    copied_count += 1
                    total_copied_files += 1
                except Exception as e:
                    print(f"    HATA - {file_name}: {str(e)}")
                    skipped_count += 1
            
            print(f"  {sub_folder}: {copied_count} dosya kopyalandı, {skipped_count} dosya atlandı")
    
    print(f"\n{'='*80}")
    print(f"TOPLAM KOPYALANAN DOSYA: {total_copied_files}")
    print(f"İşlem tamamlandı!")

def check_dataset_structure(path):
    print(f"\nVeri seti yapısı kontrol ediliyor: {path}")
    print("-" * 50)
    
    folders = ['test', 'train', 'valid']
    sub_folders = ['images', 'labels']
    
    for folder in folders:
        folder_path = os.path.join(path, folder)
        if os.path.exists(folder_path):
            print(f"✓ {folder}/")
            for sub_folder in sub_folders:
                sub_path = os.path.join(folder_path, sub_folder)
                if os.path.exists(sub_path):
                    file_count = len([f for f in os.listdir(sub_path) 
                                    if os.path.isfile(os.path.join(sub_path, f))])
                    print(f"  ✓ {sub_folder}/ ({file_count} dosya)")
                else:
                    print(f"  ✗ {sub_folder}/ (bulunamadı)")
        else:
            print(f"✗ {folder}/ (bulunamadı)")

source_dataset = r"C:\\Users\\deniz\\Desktop\\archive (2)\\BrainTumor\\BrainTumorYolov11"
target_dataset = r"C:\\Users\\deniz\\Downloads\\Labeled MRI Brain Tumor Dataset_Updated"

if __name__ == "__main__":
    print("VERİ SETİ BİRLEŞTİRME ARACI")
    print("=" * 80)
    
    check_dataset_structure(source_dataset)
    
    check_dataset_structure(target_dataset)
    
    print(f"\n{'='*80}")
    print("UYARI: Bu işlem kaynak veri setindeki dosyaları hedef klasöre kopyalayacak.")
    print("Aynı isimli dosyalar varsa yeniden adlandırılacak.")
    print(f"{'='*80}")
    
    confirmation = input("Devam etmek istiyor musunuz? (y/N): ").lower().strip()
    
    if confirmation in ['y', 'yes', 'evet', 'e']:
        merge_datasets(source_dataset, target_dataset)
    else:
        print("İşlem iptal edildi.")
`
    },
    {
      name: 'Update Labels',
      file: 'updateLabels.py',
      desc: 'Etiketleri günceller.',
      code: `import os
import glob

def update_label_files(base_path):

    folders = ['test', 'train', 'valid']  # 'label' yerine 'valid' olabilir, kontrol edin
    
    processed_files = 0
    updated_files = 0
    
    for folder in folders:
        labels_path = os.path.join(base_path, folder, 'labels')
        
        if not os.path.exists(labels_path):
            print(f"Klasör bulunamadı: {labels_path}")
            continue
            
        print(f"İşleniyor: {labels_path}")

        label_files = glob.glob(os.path.join(labels_path, '*.txt'))
        
        for file_path in label_files:
            try:
                # Dosyayı oku
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                updated_lines = []
                file_updated = False
                
                for line in lines:
                    line = line.strip()
                    if not line:  # Boş satırları atla
                        updated_lines.append(line + '\n')
                        continue
                    
                    parts = line.split()
                    if len(parts) > 0:
                        first_number = parts[0]
                        
                        # Değişiklik kuralları
                        if first_number == '1':
                            parts[0] = '0'
                            file_updated = True
                        elif first_number == '3':
                            parts[0] = '0'
                            file_updated = True
                        elif first_number == '2':
                            parts[0] = '1'
                            file_updated = True
                    
                    updated_lines.append(' '.join(parts) + '\n')
                
                # Eğer dosya güncellenirse, geri yaz
                if file_updated:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.writelines(updated_lines)
                    updated_files += 1
                    print(f"Güncellendi: {os.path.basename(file_path)}")
                
                processed_files += 1
                
            except Exception as e:
                print(f"Hata - {file_path}: {str(e)}")
    
    print(f"\nÖzet:")
    print(f"İşlenen dosya sayısı: {processed_files}")
    print(f"Güncellenen dosya sayısı: {updated_files}")

base_directory = r"C:\\Users\\deniz\\Downloads\\Labeled MRI Brain Tumor Dataset.v1-version-1.yolov11"

if __name__ == "__main__":
    print("Label dosyaları güncelleniyor...")
    print("Kurallar:")
    print("- İlk sayı 1 ise -> 0")
    print("- İlk sayı 3 ise -> 0") 
    print("- İlk sayı 2 ise -> 1")
    print("-" * 50)
    
    update_label_files(base_directory)
    print("\nİşlem tamamlandı!")
`
    }
  ];

  const toggleCode = (fileName) => {
    setShowCode(prev => ({
      ...prev,
      [fileName]: !prev[fileName]
    }));
  };

  const modelCode = `!pip install torch torchvision torchaudio
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
`;

  return (
    <div className="App">
      <header className="App-header">
        <h1>YOLOv8 Project Hub</h1>
        <div className="button-container">
          <button 
            className={`nav-button ${activeSection === 'model' ? 'active' : ''}`}
            onClick={() => setActiveSection('model')}
          >
            YOLOv8 Model
          </button>
          <button 
            className={`nav-button ${activeSection === 'dataset' ? 'active' : ''}`}
            onClick={() => setActiveSection('dataset')}
          >
            Dataset Codes
          </button>
          <button 
            className={`nav-button ${activeSection === 'training' ? 'active' : ''}`}
            onClick={() => setActiveSection('training')}
          >
            Model Training
          </button>
        </div>

        <div className="content-section">
          {activeSection === 'model' && (
            <div className="section-content yolov8-model-section">
              <h2>YOLOv8 Model Mimarisi</h2>
              <h3>1. YOLOv8'in Temel Çalışma Prensibi</h3>
              <ul>
                <li><b>"You Only Look Once" (YOLO)</b> mantığına dayanır: Girdi görüntüsünü tek bir geçişte işleyerek nesne tespiti yapar. Bu, diğer modellere göre çok daha hızlıdır.</li>
                <li><b>Grid Sistemi:</b> Görüntüyü ızgara hücrelerine böler. Her hücre, belirli sayıda bounding box ve sınıf tahmini üretir.</li>
                <li><b>Anchor-Free Mekanizma:</b> Önceki YOLO sürümlerinden farklı olarak, YOLOv8 anchor box kullanmaz. Doğrudan bounding box koordinatlarını tahmin eder.</li>
              </ul>
              <h3>2. YOLOv8 Mimarisi</h3>
              <ul>
                <li><b>Backbone (Omurga):</b> CSPDarknet mimarisi ile görüntüden özellik çıkarımı yapar. "Cross Stage Partial" blokları ile verimlilik artar.</li>
                <li><b>Neck (Boyun):</b> PANet ile farklı ölçeklerdeki özellik haritalarını birleştirir, küçük ve büyük nesnelerin tespitini iyileştirir.</li>
                <li><b>Head (Kafa):</b> Anchor-Free Detection Head ile bounding box koordinatları, nesne varlığı ve sınıf olasılıklarını tahmin eder. Çoklu ölçekli tespit için üç farklı grid kullanır.</li>
              </ul>
              <img 
                src="/yolov8nmimari.png" 
                alt="YOLOv8n Model Mimarisi" 
                className="yolov8-architecture-img"
                style={{maxWidth: '350px', height: 'auto', margin: '1.5rem 0', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.15)'}}
              />
              <h3>3. YOLOv8'in Çalışma Şekli</h3>
              <ul>
                <li><b>Girdi:</b> Görüntü tek seferde modele beslenir (genellikle 640x640 piksel).</li>
                <li><b>Özellik Çıkarımı:</b> Backbone, görüntüyü derin özellik haritalarına dönüştürür.</li>
                <li><b>Özellik Birleştirme:</b> PANet, farklı katmanlardan gelen özellikleri birleştirir.</li>
                <li><b>Tahmin:</b> Head katmanı, her grid hücresinde bounding box'ların (x, y, genişlik, yükseklik), nesne güven skoru ve sınıf olasılıklarını hesaplar.</li>
                <li><b>Post-Processing:</b> NMS (Non-Maximum Suppression) ile fazla kutular filtrelenir, düşük güven skorlu tahminler elenir.</li>
              </ul>
              <h3>4. YOLOv8'in Öne Çıkan Özellikleri</h3>
              <ul>
                <li><b>Hız ve Doğruluk Dengesi:</b> Gerçek zamanlı çalışırken yüksek doğruluk sağlar.</li>
                <li><b>Kullanım Kolaylığı:</b> Ultralytics kütüphanesi ile kolay eğitim ve dağıtım.</li>
                <li><b>Çoklu Görev Desteği:</b> Nesne tespiti, segmentasyon ve sınıflandırma aynı modelde desteklenir.</li>
                <li><b>Gelişmiş Veri Augmentasyon:</b> Mosaic augmentasyon, mixup gibi tekniklerle az verili senaryolarda bile performans artışı sağlar.</li>
              </ul>
            </div>
          )}

          {activeSection === 'dataset' && (
            <div className="section-content">
              <h2>Dataset Processing Tools</h2>
              <div className="cards-container">
                {datasetFiles.map((file, index) => (
                  <div key={index} className="code-card">
                    <h3>{file.name}</h3>
                    <div style={{fontSize: '0.98rem', color: '#b3e5fc', marginBottom: '0.5rem'}}>{file.desc}</div>
                    <button onClick={() => toggleCode(file.file)}>
                      {showCode[file.file] ? 'Hide Code' : 'Show Code'}
                    </button>
                    {showCode[file.file] && <CodeDisplay code={file.code} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'training' && (
            <div className="section-content">
              <h2>Model Training Code</h2>
              <div className="code-card">
                <h3>YOLOv8 Training Script</h3>
                <pre className="code-preview">
                  {modelCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
