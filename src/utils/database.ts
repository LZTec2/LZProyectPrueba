
import { QRCode } from '../types';

const API_URL = 'https://07p42qhn-8000.brs.devtunnels.ms/api/qr/';
const API_PUBLIC_URL = 'https://07p42qhn-8000.brs.devtunnels.ms/api/qr/public/';
const API_SEARCH_URL = 'https://07p42qhn-8000.brs.devtunnels.ms/api/qr/search/';
const API_CONTENT_URL = 'https://07p42qhn-8000.brs.devtunnels.ms/api/qr/content/';

class QRDatabase {
  // Guarda un QR usando la API Django
  async saveQRCode(qrCode: QRCode): Promise<void> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qrCode),
    });
    if (!response.ok) throw new Error('Error al guardar QR');
  }

  // Obtiene todos los QR usando la API Django
  async getAllQRCodes(): Promise<QRCode[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al cargar los QR');
    const data = await response.json();
    return data.map((qr: any) => ({
      ...qr,
      createdAt: new Date(qr.createdAt),
    }));
  }

  // Obtiene solo los QR públicos desde el endpoint dedicado
  async getPublicQRCodes(): Promise<QRCode[]> {
    const response = await fetch(API_PUBLIC_URL);
    if (!response.ok) throw new Error('Error al cargar los QR públicos');
    const data = await response.json();
    return data.map((qr: any) => ({
      ...qr,
      createdAt: new Date(qr.createdAt),
    }));
  }

  // Busca un QR por su contenido usando el endpoint dedicado
  async findQRByContent(content: string): Promise<QRCode | null> {
    const response = await fetch(`${API_CONTENT_URL}${encodeURIComponent(content)}/`);
    if (!response.ok) return null;
    const qr = await response.json();
    if (!qr || !qr.id) return null;
    return {
      ...qr,
      createdAt: new Date(qr.createdAt),
    };
  }

  // Busca QR por texto usando el endpoint dedicado
  async searchQRCodes(query: string): Promise<QRCode[]> {
    const response = await fetch(`${API_SEARCH_URL}?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Error al buscar QR');
    const data = await response.json();
    return data.map((qr: any) => ({
      ...qr,
      createdAt: new Date(qr.createdAt),
    }));
  }
}

export const qrDatabase = new QRDatabase();