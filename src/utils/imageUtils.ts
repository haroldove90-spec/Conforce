/**
 * Image processing utilities for mobile camera & file uploads.
 * Automatically downscales large mobile camera photos to crisp, lightweight JPEGs
 * so they save smoothly to Supabase and localStorage without exceeding storage limits.
 */

export const compressAndEncodeImage = (
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo del dispositivo.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al procesar la imagen seleccionada.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original Base64 if 2D context fails
          resolve(e.target?.result as string);
          return;
        }

        // Draw with smoothing for high fidelity
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};
