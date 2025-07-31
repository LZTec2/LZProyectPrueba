import React, { useState, useEffect } from 'react';
import { Search, User, QrCode, Calendar, ExternalLink, Mail, Phone, FileText } from 'lucide-react';
import { QRCode } from '../types';
import { getPublicQRCodes } from '../utils/storage';

const Gallery: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [filteredQRs, setFilteredQRs] = useState<QRCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'author' | 'content'>('name');

  useEffect(() => {
    const publicQRs = getPublicQRCodes();
    setQrCodes(publicQRs);
    setFilteredQRs(publicQRs);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredQRs(qrCodes);
      return;
    }

    const filtered = qrCodes.filter(qr => {
      const searchValue = searchTerm.toLowerCase();
      switch (searchType) {
        case 'name':
          return qr.name.toLowerCase().includes(searchValue);
        case 'author':
          return qr.author.toLowerCase().includes(searchValue);
        case 'content':
          return qr.content.toLowerCase().includes(searchValue);
        default:
          return false;
      }
    });
    
    setFilteredQRs(filtered);
  }, [searchTerm, searchType, qrCodes]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return <ExternalLink size={16} />;
      case 'email': return <Mail size={16} />;
      case 'phone': return <Phone size={16} />;
      case 'text': return <FileText size={16} />;
      default: return <QrCode size={16} />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center">
          <QrCode className="mr-3 text-blue-400" />
          Galería Pública
        </h1>
        <p className="text-gray-400">
          Explora los códigos QR compartidos por la comunidad
        </p>
      </div>

      {/* Buscador */}
      <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar códigos QR..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Por nombre</option>
            <option value="author">Por autor</option>
            <option value="content">Por contenido</option>
          </select>
        </div>
      </div>

      {/* Grid de QR Codes */}
      {filteredQRs.length === 0 ? (
        <div className="text-center py-12">
          <QrCode size={80} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {qrCodes.length === 0 ? 'No hay códigos QR públicos' : 'No se encontraron resultados'}
          </h3>
          <p className="text-gray-500">
            {qrCodes.length === 0 
              ? 'Sé el primero en compartir un código QR en la galería'
              : 'Intenta con otros términos de búsqueda'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredQRs.map((qr) => (
            <div key={qr.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/10">
              {/* Imagen del QR */}
              <div className="bg-white p-4 flex items-center justify-center">
                <img 
                  src={qr.qrDataUrl} 
                  alt={qr.name}
                  className="w-full h-48 object-contain"
                />
              </div>
              
              {/* Información */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white text-lg truncate" title={qr.name}>
                    {qr.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <User size={14} className="mr-1" />
                    <span className="truncate">{qr.author}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-300">
                    {getTypeIcon(qr.type)}
                    <span className="ml-1 capitalize">{qr.type}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(qr.createdAt)}</span>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-300 truncate" title={qr.content}>
                    {qr.content}
                  </p>
                </div>
                
                {/* Colores utilizados */}
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-600"
                    style={{ backgroundColor: qr.color1 }}
                    title={`Color principal: ${qr.color1}`}
                  />
                  {qr.color2 && (
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-600"
                      style={{ backgroundColor: qr.color2 }}
                      title={`Color secundario: ${qr.color2}`}
                    />
                  )}
                  <span className="text-xs text-gray-500 ml-2">
                    {qr.color2 ? 'Gradiente' : 'Color sólido'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;