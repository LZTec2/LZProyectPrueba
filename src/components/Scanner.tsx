import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, AlertTriangle, CheckCircle, Camera, Upload } from 'lucide-react';
import { findQRByContent } from '../utils/storage';
import { QRCode } from '../types';

const Scanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [qrInfo, setQrInfo] = useState<QRCode | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scannerMode, setScannerMode] = useState<'camera' | 'file'>('camera');

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    setScanResult('');
    setQrInfo(null);
    setIsRegistered(null);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
        stopScanning();
      },
      (error) => {
        // Silenciar errores de escaneo continuo
      }
    );
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    
    // Buscar en la base de datos local
    const foundQR = findQRByContent(decodedText);
    
    if (foundQR) {
      setQrInfo(foundQR);
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const html5QrCode = new (window as any).Html5Qrcode("file-reader");
    
    html5QrCode.scanFile(file, true)
      .then((decodedText: string) => {
        handleScanSuccess(decodedText);
      })
      .catch((err: any) => {
        console.error('Error escaneando archivo:', err);
        alert('No se pudo leer el código QR del archivo');
      });
  };

  const openLink = (content: string) => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      window.open(content, '_blank');
    } else if (content.includes('@')) {
      window.location.href = `mailto:${content}`;
    } else if (content.startsWith('+') || /^\d+$/.test(content)) {
      window.location.href = `tel:${content}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center">
          <ScanLine className="mr-3 text-blue-400" />
          Escáner de QR
        </h1>
        <p className="text-gray-400">
          Escanea códigos QR para verificar si están registrados en nuestra base de datos
        </p>
      </div>

      {/* Selector de modo */}
      <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setScannerMode('camera')}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              scannerMode === 'camera'
                ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Camera size={20} />
            <span>Usar Cámara</span>
          </button>
          
          <button
            onClick={() => setScannerMode('file')}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              scannerMode === 'file'
                ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Upload size={20} />
            <span>Subir Archivo</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Panel de escaneo */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">
            {scannerMode === 'camera' ? 'Escaneo por Cámara' : 'Escaneo por Archivo'}
          </h2>
          
          {scannerMode === 'camera' ? (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full"></div>
              
              <div className="flex justify-center space-x-4">
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-green-600 transition-all duration-200"
                  >
                    <Camera size={20} />
                    <span>Iniciar Escaneo</span>
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex items-center space-x-2 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200"
                  >
                    <span>Detener Escaneo</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div id="file-reader" className="hidden"></div>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                <Upload size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 mb-4">
                  Selecciona una imagen con código QR
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* Panel de resultados */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Resultado del Escaneo</h2>
          
          {scanResult ? (
            <div className="space-y-6">
              {/* Estado de registro */}
              <div className={`p-4 rounded-lg border-2 ${
                isRegistered 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-yellow-500 bg-yellow-500/10'
              }`}>
                <div className="flex items-center space-x-3">
                  {isRegistered ? (
                    <CheckCircle className="text-green-400" size={24} />
                  ) : (
                    <AlertTriangle className="text-yellow-400" size={24} />
                  )}
                  <div>
                    <h3 className={`font-semibold ${
                      isRegistered ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {isRegistered ? 'QR Registrado' : 'QR No Registrado'}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {isRegistered 
                        ? 'Este código QR fue creado con Check Code'
                        : 'QR no registrado. Ingrese bajo su propio riesgo'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del QR */}
              {qrInfo && (
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-white text-lg">{qrInfo.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Autor:</span>
                      <p className="text-white">{qrInfo.author}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Tipo:</span>
                      <p className="text-white capitalize">{qrInfo.type}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Creado:</span>
                      <p className="text-white">
                        {new Intl.DateTimeFormat('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(qrInfo.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido escaneado */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Contenido:</h4>
                <p className="text-gray-300 break-all">{scanResult}</p>
                
                {/* Botón de acción */}
                {(scanResult.startsWith('http') || scanResult.includes('@') || /^\+?\d+$/.test(scanResult)) && (
                  <button
                    onClick={() => openLink(scanResult)}
                    className="mt-3 bg-gradient-to-r from-blue-600 to-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-green-600 transition-all duration-200"
                  >
                    {scanResult.startsWith('http') ? 'Abrir Enlace' :
                     scanResult.includes('@') ? 'Enviar Email' :
                     'Llamar'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ScanLine size={80} className="mb-4 opacity-50" />
              <p className="text-lg">Esperando escaneo...</p>
              <p className="text-sm">
                {scannerMode === 'camera' 
                  ? 'Apunta la cámara hacia un código QR'
                  : 'Selecciona una imagen para escanear'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;