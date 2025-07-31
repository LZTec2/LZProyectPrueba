import { QRCode } from '../types';

const DB_NAME = 'CheckCodeDB';
const DB_VERSION = 1;
const STORE_NAME = 'qrcodes';

class QRDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('author', 'author', { unique: false });
          store.createIndex('content', 'content', { unique: false });
        }
      };
    });
  }

  async saveQRCode(qrCode: QRCode): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(qrCode);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllQRCodes(): Promise<QRCode[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getPublicQRCodes(): Promise<QRCode[]> {
    const allCodes = await this.getAllQRCodes();
    return allCodes.filter(qr => qr.isPublic);
  }

  async findQRByContent(content: string): Promise<QRCode | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('content');
      const request = index.get(content);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async searchQRCodes(query: string): Promise<QRCode[]> {
    const allCodes = await this.getPublicQRCodes();
    const lowerQuery = query.toLowerCase();
    
    return allCodes.filter(qr => 
      qr.name.toLowerCase().includes(lowerQuery) ||
      qr.author.toLowerCase().includes(lowerQuery) ||
      qr.content.toLowerCase().includes(lowerQuery)
    );
  }
}

export const qrDatabase = new QRDatabase();