import os
import shutil
import glob

def merge_datasets(source_path, target_path):
    """
    Kaynak veri setini hedef veri setine birleştirir
    """
    
    # Ana klasörler
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
            
        # Hedef klasörü yoksa oluştur
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
                
            # Hedef alt klasörü yoksa oluştur
            if not os.path.exists(target_sub_path):
                os.makedirs(target_sub_path)
                print(f"  Oluşturulan alt klasör: {target_sub_path}")
            
            # Dosyaları bul ve kopyala
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
                
                # Dosya zaten varsa, yeniden adlandır
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
    """
    Veri seti yapısını kontrol eder
    """
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

# Yolları tanımla
source_dataset = r"C:\Users\deniz\Desktop\archive (2)\BrainTumor\BrainTumorYolov11"
target_dataset = r"C:\Users\deniz\Downloads\Labeled MRI Brain Tumor Dataset_Updated"

if __name__ == "__main__":
    print("VERİ SETİ BİRLEŞTİRME ARACI")
    print("=" * 80)
    
    # Kaynak veri seti yapısını kontrol et
    check_dataset_structure(source_dataset)
    
    # Hedef veri seti yapısını kontrol et
    check_dataset_structure(target_dataset)
    
    # Kullanıcıdan onay al
    print(f"\n{'='*80}")
    print("UYARI: Bu işlem kaynak veri setindeki dosyaları hedef klasöre kopyalayacak.")
    print("Aynı isimli dosyalar varsa yeniden adlandırılacak.")
    print(f"{'='*80}")
    
    confirmation = input("Devam etmek istiyor musunuz? (y/N): ").lower().strip()
    
    if confirmation in ['y', 'yes', 'evet', 'e']:
        merge_datasets(source_dataset, target_dataset)
    else:
        print("İşlem iptal edildi.")