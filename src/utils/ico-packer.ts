/**
 * Minimalist Client-Sided ICO Packer
 * Wraps a single PNG image into a valid .ico container.
 * 100% Private, Hardware-Accelerated, Zero Uploads.
 */

export const createIcoFromPng = (pngData: Uint8Array, width: number, height: number): Blob => {
  const HEADER_SIZE = 6;
  const DIRECTORY_SIZE = 16;
  const TOTAL_HEADER_SIZE = HEADER_SIZE + DIRECTORY_SIZE;

  const buffer = new ArrayBuffer(TOTAL_HEADER_SIZE);
  const view = new DataView(buffer);

  // --- ICON HEADER (6 bytes) ---
  view.setUint16(0, 0, true);    // Reserved (0)
  view.setUint16(2, 1, true);    // Type (1 = Icon)
  view.setUint16(4, 1, true);    // Image Count (1)

  // --- DIRECTORY ENTRY (16 bytes) ---
  // If dimension is 256, it must be represented as 0
  view.setUint8(6, width >= 256 ? 0 : width);
  view.setUint8(7, height >= 256 ? 0 : height);
  view.setUint8(8, 0);           // Color palette count (0 for PNG/32bpp)
  view.setUint8(9, 0);           // Reserved
  view.setUint16(10, 1, true);   // Color planes (1)
  view.setUint16(12, 32, true);  // Bits per pixel (32 for modern PNG-icons)
  
  // Image Data Size (Little Endian)
  view.setUint32(14, pngData.length, true);
  
  // Offset of the image data from the beginning of the file
  view.setUint32(18, TOTAL_HEADER_SIZE, true);

  // Combine Header + PNG Data
  const icoFile = new Uint8Array(TOTAL_HEADER_SIZE + pngData.length);
  icoFile.set(new Uint8Array(buffer), 0);
  icoFile.set(pngData, TOTAL_HEADER_SIZE);

  return new Blob([icoFile], { type: "image/x-icon" });
};
