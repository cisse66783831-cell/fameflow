/**
 * Compresse une image tout en gardant la meilleure qualité possible
 * @param file - Le fichier image à compresser
 * @param maxSizeMB - La taille maximale en MB (par défaut 2MB)
 * @param maxDimension - La dimension maximale (largeur ou hauteur)
 * @returns Promise<File> - Le fichier compressé
 */
export const compressImage = async (
  file: File,
  maxSizeMB: number = 2,
  maxDimension: number = 2048
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      let { width, height } = img;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Activer le lissage haute qualité
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Dessiner l'image
      ctx.drawImage(img, 0, 0, width, height);

      // Fonction pour trouver la qualité optimale
      const findOptimalQuality = (targetSizeBytes: number): Promise<Blob> => {
        return new Promise((resolveBlob) => {
          let quality = 0.95;
          const minQuality = 0.5;
          const step = 0.05;
          
          const tryQuality = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolveBlob(new Blob());
                  return;
                }
                
                if (blob.size <= targetSizeBytes || quality <= minQuality) {
                  resolveBlob(blob);
                } else {
                  quality -= step;
                  tryQuality();
                }
              },
              'image/jpeg',
              quality
            );
          };
          
          tryQuality();
        });
      };

      const targetSize = maxSizeMB * 1024 * 1024;
      
      // Essayer d'abord en PNG pour les images avec transparence
      if (file.type === 'image/png') {
        canvas.toBlob(
          async (pngBlob) => {
            if (pngBlob && pngBlob.size <= targetSize) {
              const compressedFile = new File([pngBlob], file.name, { type: 'image/png' });
              resolve(compressedFile);
            } else {
              // Si PNG trop gros, convertir en JPEG haute qualité
              const jpegBlob = await findOptimalQuality(targetSize);
              const newName = file.name.replace(/\.png$/i, '.jpg');
              const compressedFile = new File([jpegBlob], newName, { type: 'image/jpeg' });
              resolve(compressedFile);
            }
          },
          'image/png'
        );
      } else {
        findOptimalQuality(targetSize).then((blob) => {
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
          resolve(compressedFile);
        });
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Vérifie si un fichier dépasse la taille recommandée
 */
export const needsCompression = (file: File, thresholdMB: number = 6): boolean => {
  return file.size > thresholdMB * 1024 * 1024;
};

/**
 * Formate la taille du fichier pour l'affichage
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
};
