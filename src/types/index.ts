export interface QRCode {
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
  createdAt: Date;
  isPublic: boolean;
}

export interface QRGeneratorOptions {
  name: string;
  type: 'url' | 'email' | 'phone' | 'text';
  content: string;
  author: string;
  color1: string;
  color2?: string;
  eyeStyle: 'square' | 'circle' | 'rounded';
  dotStyle: 'square' | 'circle' | 'rounded';
  logoImage?: File;
  isPublic: boolean;
}