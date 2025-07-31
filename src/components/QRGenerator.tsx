import React, { useState, useRef } from 'react';
import { Download, Upload, Palette, Eye, Grid, Sparkles } from 'lucide-react';
import { generateQRCode } from '../utils/qrGenerator';
import { qrDatabase } from '../utils/database';
import { QRCode, QRGeneratorOptions } from '../types';

const QRGenerator: React.FC = () => {
  const [options, setOptions] = useState<QRGeneratorOptions>({
    name: '',
    type: 'url',
    content: '',
    author: '',
    color1: '#322E7A',
    color2: '',
    eyeStyle: 'square',
    dotStyle: 'square',
    isPublic: false
  });
  
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [logoImage, setLogoImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!options.content || !options.name || !options.author) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating QR with options:', options);
      const qrCode = await generateQRCode(options.content, {
        color1: options.color1,
        color2: options.color2 || undefined,
        eyeStyle: options.eyeStyle,
        dotStyle: options.dotStyle,
        logoImage: logoImage || undefined
      });

      setQrDataURL(qrCode);

      // Save to database
      const qrData: QRCode = {
        id: Date.now().toString(),
        name: options.name,
        type: options.type,
        content: options.content,
        author: options.author,
        color1: options.color1,
        color2: options.color2 || undefined,
        eyeStyle: options.eyeStyle,
        dotStyle: options.dotStyle,
        logoImage: logoImage || undefined,
        createdAt: new Date(),
        isPublic: options.isPublic
      };

      await qrDatabase.saveQRCode(qrData);
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('Error al generar el código QR');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrDataURL) return;

    const link = document.createElement('a');
    link.download = `${options.name}-qr.png`;
    link.href = qrDataURL;
    link.click();
  };

  const getPlaceholder = () => {
    switch (options.type) {
      case 'url': return 'https://ejemplo.com';
      case 'email': return 'correo@ejemplo.com';
      case 'phone': return '+1234567890';
      case 'text': return 'Tu texto aquí';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Palette className="mr-2" size={20} />
              Configuración del QR
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre único *
                </label>
                <input
                  type="text"
                  value={options.name}
                  onChange={(e) => setOptions({...options, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mi código QR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Autor *
                </label>
                <input
                  type="text"
                  value={options.author}
                  onChange={(e) => setOptions({...options, author: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de contenido
                </label>
                <select
                  value={options.type}
                  onChange={(e) => setOptions({...options, type: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="url">URL</option>
                  <option value="email">Email</option>
                  <option value="phone">Teléfono</option>
                  <option value="text">Texto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenido *
                </label>
                <input
                  type="text"
                  value={options.content}
                  onChange={(e) => setOptions({...options, content: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getPlaceholder()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color principal
                  </label>
                  <input
                    type="color"
                    value={options.color1}
                    onChange={(e) => setOptions({...options, color1: e.target.value})}
                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color degradado (opcional)
                  </label>
                  <input
                    type="color"
                    value={options.color2}
                    onChange={(e) => setOptions({...options, color2: e.target.value})}
                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Eye className="mr-1" size={16} />
                    Estilo de ojos
                  </label>
                  <select
                    value={options.eyeStyle}
                    onChange={(e) => setOptions({...options, eyeStyle: e.target.value as any})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="square">Cuadrado</option>
                    <option value="circle">Círculo</option>
                    <option value="rounded">Redondeado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Grid className="mr-1" size={16} />
                    Estilo de puntos
                  </label>
                  <select
                    value={options.dotStyle}
                    onChange={(e) => setOptions({...options, dotStyle: e.target.value as any})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="square">Cuadrado</option>
                    <option value="circle">Círculo</option>
                    <option value="rounded">Redondeado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Upload className="mr-1" size={16} />
                  Logo central (opcional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <Upload className="mr-2" size={16} />
                  Subir imagen
                </button>
                {logoImage && (
                  <div className="mt-2">
                    <img src={logoImage} alt="Logo preview" className="w-16 h-16 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={options.isPublic}
                  onChange={(e) => setOptions({...options, isPublic: e.target.checked})}
                  className="mr-2 rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-300">
                  Mostrar en galería pública
                </label>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" size={20} />
                  Generar QR Estilizado
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Eye className="mr-2" size={20} />
              Vista previa
            </h2>
            
            {qrDataURL ? (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img src={qrDataURL} alt="QR Code" className="w-64 h-64" />
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  <p>✓ QR generado con estilos personalizados</p>
                  <p>✓ Marca de verificación incluida</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-500 transition-all flex items-center justify-center"
                >
                  <Download className="mr-2" size={20} />
                  Descargar QR
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="w-64 h-64 mx-auto bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <span className="text-gray-500">QR estilizado aparecerá aquí</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;