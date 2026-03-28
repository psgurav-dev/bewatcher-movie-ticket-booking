function isSameOriginUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  if (typeof window === "undefined") return false;
  try {
    const u = new URL(url, window.location.origin);
    return u.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Extract dominant colors from an image URL.
 * Prefer same-origin URLs (e.g. `/api/movies/poster?...`) so canvas is not tainted;
 * TMDB CDN often blocks `getImageData` when loaded cross-origin.
 */
export async function extractPalette(imageUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!isSameOriginUrl(imageUrl)) {
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";
    }
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No context');
      
      // Resize for performance
      const scale = Math.min(1, 200 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.error('drawImage failed', e);
        return reject(e);
      }

      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.error('getImageData blocked (CORS / tainted canvas)', e);
        return reject(e);
      }
      const data = imageData.data;
      const colorCounts: Record<string, number> = {};
      
      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 10) * 10;
        const g = Math.round(data[i+1] / 10) * 10;
        const b = Math.round(data[i+2] / 10) * 10;
        const a = data[i+3];
        
        if (a < 128) continue; 
        
        const rgb = `rgb(${r},${g},${b})`;
        colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
      }
      
      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(entry => entry[0]);
        
      resolve(sortedColors);
    };

    img.onerror = (e) => {
      console.error("Image load error", e);
      reject(e);
    };
  });
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

export function getContrastColor(rgbStr: string): string {
  const match = rgbStr.match(/\d+/g);
  if (!match) return '#ffffff';
  const [r, g, b] = match.map(Number);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}
