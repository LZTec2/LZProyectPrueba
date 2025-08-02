import { QRCode } from '../types';
import { apiService, APIQRCode, CreateQRRequest } from '../services/api';

// Convert API QR to local QR format
const convertAPIQRToLocal = (apiQR: APIQRCode): QRCode => ({
  ...apiQR,
  createdAt: new Date(apiQR.createdAt),
});

// Convert local QR to API format
const convertLocalQRToAPI = (localQR: Omit<QRCode, 'id' | 'createdAt'>): CreateQRRequest => ({
  name: localQR.name,
  type: localQR.type,
  content: localQR.content,
  author: localQR.author,
  color1: localQR.color1,
  color2: localQR.color2,
  eyeStyle: localQR.eyeStyle,
  dotStyle: localQR.dotStyle,
  logoImage: localQR.logoImage,
  isPublic: localQR.isPublic,
});

class APIDatabase {
  async saveQRCode(qrCode: Omit<QRCode, 'id' | 'createdAt'>): Promise<QRCode> {
    try {
      const apiQRData = convertLocalQRToAPI(qrCode);
      const savedQR = await apiService.createQR(apiQRData);
      return convertAPIQRToLocal(savedQR);
    } catch (error) {
      console.error('Error saving QR code to API:', error);
      throw new Error('Failed to save QR code to server');
    }
  }

  async getAllQRCodes(): Promise<QRCode[]> {
    try {
      const apiQRs = await apiService.getAllQRs();
      return apiQRs.map(convertAPIQRToLocal);
    } catch (error) {
      console.error('Error fetching QR codes from API:', error);
      throw new Error('Failed to fetch QR codes from server');
    }
  }

  async getPublicQRCodes(): Promise<QRCode[]> {
    try {
      const apiQRs = await apiService.getPublicQRs();
      return apiQRs.map(convertAPIQRToLocal);
    } catch (error) {
      console.error('Error fetching public QR codes from API:', error);
      throw new Error('Failed to fetch public QR codes from server');
    }
  }

  async findQRByContent(content: string): Promise<QRCode | null> {
    try {
      const result = await apiService.validateQR(content);
      return result.exists && result.qr ? convertAPIQRToLocal(result.qr) : null;
    } catch (error) {
      console.error('Error validating QR code with API:', error);
      throw new Error('Failed to validate QR code with server');
    }
  }

  async searchQRCodes(query: string): Promise<QRCode[]> {
    try {
      const apiQRs = await apiService.searchQRs(query);
      return apiQRs.map(convertAPIQRToLocal);
    } catch (error) {
      console.error('Error searching QR codes with API:', error);
      throw new Error('Failed to search QR codes on server');
    }
  }
}

export const apiDatabase = new APIDatabase();