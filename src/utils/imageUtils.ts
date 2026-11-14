/**
 * Image processing utilities for mobile camera & file uploads.
 * Automatically downscales large mobile camera photos to crisp, lightweight JPEGs
 * so they save smoothly to Supabase and localStorage without exceeding storage limits.
 */

const ALLOWED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i;

export const isLikelyImageFile = (file: File): boolean => {
  if (file.type && file.type.startsWith('image/')) return true;
  if (!file.type && file.name && ALLOWED_IMAGE_EXTENSIONS.test(file.name)) return true;
  return false;
};

export const compressAndEncodeImage = (
  file: File,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.78
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isLikelyImageFile(file)) {
      reject(new Error('El archivo seleccionado no es una imagen válida (usa JPG, PNG o WebP).'));
      return;
    }

    const isHeic =
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      /\.(heic|heif)$/i.test(file.name || '');

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen desde tu dispositivo.'));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('La imagen seleccionada está vacía.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        if (isHeic) {
          reject(
            new Error(
              'Tu teléfono guardó la foto en formato HEIC (iPhone). Cambia Cámara -> Formatos -> "Más compatible" (JPG) o elige una foto JPG/PNG.'
            )
          );
        } else {
          reject(new Error('El navegador no pudo procesar esta imagen. Prueba con otra foto JPG o PNG.'));
        }
      };

      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || maxWidth;
          let height = img.naturalHeight || img.height || maxHeight;

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
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          // White background prevents transparent PNGs from turning black when converted to JPEG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        } catch (err) {
          reject(new Error('No se pudo comprimir la foto seleccionada.'));
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
};

export const isPlaceholderImage = (src?: string): boolean => {
  if (!src || !src.trim()) return true;
  return src.startsWith('data:image/svg+xml');
};

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const buildSafeProductPlaceholder = (productName: string): string => {
  const cleanName = (productName || 'Producto').trim();
  const initials = escapeXml(cleanName.slice(0, 2).toUpperCase() || 'CF');
  const label = escapeXml(cleanName.slice(0, 22));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f8fafc"/><circle cx="200" cy="175" r="76" fill="#fee2e2"/><text x="200" y="182" font-family="Arial,sans-serif" font-weight="900" font-size="44" fill="#D4021D" text-anchor="middle" dominant-baseline="middle">${initials}</text><text x="200" y="305" font-family="Arial,sans-serif" font-weight="700" font-size="20" fill="#334155" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const buildSafeBusinessBanner = (
  businessName: string,
  category?: string
): string => {
  const cleanName = escapeXml((businessName || 'Comercio Aliado').trim().slice(0, 28));
  const cleanCat = escapeXml((category || 'ConForce Marketplace').trim().slice(0, 32));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420" viewBox="0 0 900 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#18181b"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><rect width="900" height="420" fill="url(#g)"/><text x="450" y="190" font-family="Arial,sans-serif" font-weight="900" font-size="42" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${cleanName}</text><text x="450" y="250" font-family="Arial,sans-serif" font-weight="700" font-size="22" fill="#fca5a5" text-anchor="middle" dominant-baseline="middle">${cleanCat}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const resolveProductImage = (
  image?: string,
  images?: string[],
  productName?: string
): string => {
  const realExtra = Array.isArray(images)
    ? images.find((img) => img && img.trim() && !isPlaceholderImage(img))
    : undefined;

  if (image && image.trim() && !isPlaceholderImage(image)) {
    return image;
  }
  if (realExtra) {
    return realExtra;
  }
  if (image && image.trim()) {
    return image;
  }
  return buildSafeProductPlaceholder(productName || 'Producto');
};
