/**
 * Encodes ImageData into a 24-bit BMP (Bitmap) file in pure JavaScript.
 * This is a 100% Native implementation that ensures "True BMP" headers.
 */
export function imageDataToBmp(imageData: ImageData): Blob {
  const { width, height, data } = imageData;
  
  // BMP row width must be a multiple of 4 bytes (padding)
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;
  
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  
  // --- BITMAP FILE HEADER (14 bytes) ---
  view.setUint8(0, 0x42);            // "B"
  view.setUint8(1, 0x4D);            // "M"
  view.setUint32(2, fileSize, true); // File Size
  view.setUint32(6, 0, true);        // Reservoir
  view.setUint32(10, 54, true);      // Offset to pixel data
  
  // --- DIB HEADER / BITMAPINFOHEADER (40 bytes) ---
  view.setUint32(14, 40, true);      // Header size
  view.setInt32(18, width, true);    // Width
  view.setInt32(22, height, true);   // Height (positive = bottom-to-top)
  view.setUint16(26, 1, true);       // Planes
  view.setUint16(28, 24, true);      // Bits per pixel (24-bit BGR)
  view.setUint32(30, 0, true);       // Compression (0 = BI_RGB)
  view.setUint32(34, pixelDataSize, true); // Image size
  view.setInt32(38, 2835, true);     // X pixels per meter (72 DPI)
  view.setInt32(42, 2835, true);     // Y pixels per meter (72 DPI)
  view.setUint32(46, 0, true);       // Colors in palette
  view.setUint32(50, 0, true);       // Important colors
  
  // --- PIXEL DATA ---
  // BMP stores pixels from bottom to top, BGR order
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const pixelIdx = (y * width + x) * 4;
      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];
      
      view.setUint8(offset++, b);
      view.setUint8(offset++, g);
      view.setUint8(offset++, r);
    }
    // Row Padding (to 4-byte boundary)
    const padding = rowSize - (width * 3);
    for (let p = 0; p < padding; p++) {
      view.setUint8(offset++, 0);
    }
  }
  
  return new Blob([buffer], { type: "image/bmp" });
}
