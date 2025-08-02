const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface APIQRCode {
  id: string;
  name: string;
  type: 'url' | 'email' | 'phone' | 'text';
  content: string;
  author: string;
  color1: string;
  color2?: string;
  eyeStyle: 'square' | 'circle' | 'rounded';
  dotStyle: 'square' | 'circle' | 'rounded';
  logoImage?: string;
  createdAt: string;
  isPublic: boolean;
}

export interface CreateQRRequest {
  name: string;
  type: 'url' | 'email' | 'phone' | 'text';
  content: string;
  author: string;
  color1: string;
  color2?: string;
  eyeStyle: 'square' | 'circle' | 'rounded';
  dotStyle: 'square' | 'circle' | 'rounded';
  logoImage?: string;
  isPublic: boolean;
}

export interface ValidateQRRequest {
  content: string;
}

export interface ValidateQRResponse {
  exists: boolean;
  qr?: APIQRCode;
}

class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Create a new QR code
  async createQR(qrData: CreateQRRequest): Promise<APIQRCode> {
    return this.request<APIQRCode>('/qr/', {
      method: 'POST',
      body: JSON.stringify(qrData),
    });
  }

  // Get all QR codes
  async getAllQRs(): Promise<APIQRCode[]> {
    return this.request<APIQRCode[]>('/qr/');
  }

  // Get only public QR codes
  async getPublicQRs(): Promise<APIQRCode[]> {
    const allQRs = await this.getAllQRs();
    return allQRs.filter(qr => qr.isPublic);
  }

  // Validate if a QR code exists in the database
  async validateQR(content: string): Promise<ValidateQRResponse> {
    return this.request<ValidateQRResponse>('/qr/validate/', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Search QR codes
  async searchQRs(query: string): Promise<APIQRCode[]> {
    const params = new URLSearchParams({ q: query });
    return this.request<APIQRCode[]>(`/qr/search/?${params}`);
  }
}

export const apiService = new APIService();