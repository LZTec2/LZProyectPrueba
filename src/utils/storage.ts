import { QRCode } from '../types';

const STORAGE_KEY = 'checkcode_qrs';

export const saveQRCode = (qrCode: QRCode): void => {
  const existingQRs = getStoredQRCodes();
  const updatedQRs = [...existingQRs, qrCode];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQRs));
};

export const getStoredQRCodes = (): QRCode[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored).map((qr: any) => ({
      ...qr,
      createdAt: new Date(qr.createdAt)
    }));
  } catch {
    return [];
  }
};

export const getPublicQRCodes = (): QRCode[] => {
  return getStoredQRCodes().filter(qr => qr.isPublic);
};

export const findQRByContent = (content: string): QRCode | null => {
  const qrs = getStoredQRCodes();
  return qrs.find(qr => qr.content === content) || null;
};

export const downloadQRCode = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};