import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, ExternalLink, Eye, Download } from 'lucide-react';
import { qrDatabase } from '../utils/database';
import { QRCode } from '../types';
import { generateQRCode } from '../utils/qrGenerator';

const QRGallery: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<QRCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'name' | 'author'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const [qrImages, setQrImages] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadQRCodes();
  }, []);

  useEffect(() => {
    filterQRCodes();
  }, [searchQuery, searchType, qrCodes]);

  const loadQRCodes = async () => {
    try {
      const codes = await qrDatabase.getPublicQRCodes();
      setQrCodes(codes);
      
      // Generate QR images for each code
      const images: {[key: string]: string} = {};
      for (const qr of codes) {
        try {
          const qrImage = await generateQRCode(qr.content, {
            color1: qr.color1,
            color2: qr.color2,
            eyeStyle: qr.eyeStyle,
            dotStyle: qr.dotStyle,
            logoImage: qr.logoImage
          });
          images[qr.id] = qrImage;
        } catch (error) {
          console.error(`Error generating QR for ${qr.id}:`, error);
        }
      }
      setQrImages(images);
      setLoading(false);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      setLoading(false);
    }
  };

  const filterQRCodes = () => {
    if (!searchQuery.trim()) {
      setFilteredCodes(qrCodes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = qrCodes.filter(qr => {
      switch (searchType) {
        case 'name':
          return qr.name.toLowerCase().includes(query);
        case 'author':
          return qr.author.toLowerCase().includes(query);
        default:
          return (
            qr.name.toLowerCase().includes(query) ||
            qr.author.toLowerCase().includes(query) ||
            qr.content.toLowerCase().includes(query)
          );
      }
    });
    setFilteredCodes(filtered);
  };

  const downloadQR = async (qr: QRCode, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const qrImage = qrImages[qr.id];
    if (!qrImage) return;

    const link = document.createElement('a');
    link.download = `${qr.name}-qr.png`;
    link.href = qrImage;
    link.click();
  };

  const openContent = (content: string) => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      window.open(content, '_blank');
    } else if (content.includes('@') && content.includes('.')) {
      window.open(`mailto:${content}`, '_blank');
    } else if (content.startsWith('+') || /^\d+$/.test(content.replace(/[\s-()]/g, ''))) {
      window.open(`tel:${content}`, '_blank');
    } else {
      navigator.clipboard.writeText(content).then(() => {
        alert('Texto copiado al portapapeles');
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando galería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-6">Galería Pública de QR</h2>
        
        {/* Search */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar códigos QR..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Buscar en todo</option>
              <option value="name">Por nombre</option>
              <option value="author">Por autor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredCodes.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {searchQuery ? 'No se encontraron códigos QR' : 'No hay códigos QR públicos aún'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCodes.map((qr) => (
            <div
              key={qr.id}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-blue-500 transition-colors cursor-pointer group"
              onClick={() => setSelectedQR(qr)}
            >
              <div className="bg-white p-4 flex items-center justify-center relative">
                {qrImages[qr.id] ? (
                  <img 
                    src={qrImages[qr.id]} 
                    alt={`QR Code for ${qr.name}`}
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Cargando...</span>
                  </div>
                )}
                
                {/* Download button */}
                <button
                  onClick={(e) => downloadQR(qr, e)}
                  className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                  title="Descargar QR"
                >
                  <Download size={16} />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 truncate">{qr.name}</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center">
                    <User size={14} className="mr-2" />
                    <span className="truncate">{qr.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2" />
                    <span>{new Date(qr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    qr.type === 'url' ? 'bg-blue-900 text-blue-300' :
                    qr.type === 'email' ? 'bg-green-900 text-green-300' :
                    qr.type === 'phone' ? 'bg-purple-900 text-purple-300' :
                    'bg-gray-800 text-gray-300'
                  }`}>
                    {qr.type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{selectedQR.name}</h3>
                <button
                  onClick={() => setSelectedQR(null)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
                {qrImages[selectedQR.id] ? (
                  <img 
                    src={qrImages[selectedQR.id]} 
                    alt={`QR Code for ${selectedQR.name}`}
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Cargando QR...</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Autor:</span>
                  <span className="text-white ml-2">{selectedQR.author}</span>
                </div>
                <div>
                  <span className="text-gray-400">Tipo:</span>
                  <span className="text-white ml-2">{selectedQR.type}</span>
                </div>
                <div>
                  <span className="text-gray-400">Contenido:</span>
                  <p className="text-white mt-1 break-all font-mono text-xs bg-gray-800 p-2 rounded">
                    {selectedQR.content}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Creado:</span>
                  <span className="text-white ml-2">{new Date(selectedQR.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => openContent(selectedQR.content)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-500 transition-all flex items-center justify-center"
                >
                  <ExternalLink className="mr-2" size={16} />
                  Abrir Contenido
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadQR(selectedQR, e);
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center"
                >
                  <Download className="mr-2" size={16} />
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGallery;