import os
import glob

def update_label_files(base_path):
    """
    Belirtilen dizindeki tüm label dosyalarını tarar ve değerleri günceller:
    - İlk sayı 1 ise -> 0 yap
    - İlk sayı 3 ise -> 0 yap  
    - İlk sayı 2 ise -> 1 yap
    """
    
    # Ana klasörleri tanımla
    folders = ['test', 'train', 'valid']  # 'label' yerine 'valid' olabilir, kontrol edin
    
    processed_files = 0
    updated_files = 0
    
    for folder in folders:
        labels_path = os.path.join(base_path, folder, 'labels')
        
        if not os.path.exists(labels_path):
            print(f"Klasör bulunamadı: {labels_path}")
            continue
            
        print(f"İşleniyor: {labels_path}")
        
        # .txt dosyalarını bul
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

# Ana dizin yolu
base_directory = r"C:\Users\deniz\Downloads\Labeled MRI Brain Tumor Dataset.v1-version-1.yolov11"

# Scripti çalıştır
if __name__ == "__main__":
    print("Label dosyaları güncelleniyor...")
    print("Kurallar:")
    print("- İlk sayı 1 ise -> 0")
    print("- İlk sayı 3 ise -> 0") 
    print("- İlk sayı 2 ise -> 1")
    print("-" * 50)
    
    update_label_files(base_directory)
    print("\nİşlem tamamlandı!")