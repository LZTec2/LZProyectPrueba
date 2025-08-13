// Componente principal para escanear y verificar códigos QR
import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { qrDatabase } from '../utils/database';
import { QRCode } from '../types';

const QRScannerComponent: React.FC = () => {
  // Estado para controlar si la cámara está activa
  const [isScanning, setIsScanning] = useState(false); // ¿Está escaneando con cámara?
  const [scanResult, setScanResult] = useState<string>(''); // Resultado del QR leído
  const [qrInfo, setQrInfo] = useState<QRCode | null>(null); // Info del QR en la base de datos
  const [isVerified, setIsVerified] = useState<boolean | null>(null); // ¿El QR está verificado?
  const [error, setError] = useState<string>(''); // Mensaje de error

  // Referencias a elementos del DOM
  const videoRef = useRef<HTMLVideoElement>(null); // Video para cámara
  const fileInputRef = useRef<HTMLInputElement>(null); // Input para subir imagen
  const qrScannerRef = useRef<QrScanner | null>(null); // Instancia de QrScanner

  // Inicia el escaneo usando la cámara del dispositivo
  const startCameraScanning = async () => {
    try {
      setError('');
      if (!videoRef.current) return;

      // Detener y limpiar cualquier escáner previo
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }

      // Crear nueva instancia de QrScanner y configurar callback
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          // Cuando detecta un QR, procesa el resultado y detiene el escaneo
          await handleScanResult(result.data);
          stopScanning();
        },
        {
          highlightScanRegion: true, // Resalta la región de escaneo
          highlightCodeOutline: true, // Resalta el contorno del QR
          preferredCamera: 'environment' // Usa la cámara trasera si es posible
        }
      );

      // Inicia la cámara y el escaneo
      await qrScannerRef.current.start();
      setIsScanning(true);
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Error al acceder a la cámara. Verifique los permisos.');
    }
  };

  // Detiene el escaneo y libera recursos de la cámara
  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Permite subir una imagen y escanear el QR en ella
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      // Usa QrScanner para leer el QR de la imagen subida
      const result = await QrScanner.scanImage(file);
      await handleScanResult(result);
    } catch (err) {
      console.error('Error scanning image:', err);
      setError('No se pudo leer el código QR de la imagen.');
    }
  };

  // Procesa el resultado del QR leído (de cámara o imagen)
  const handleScanResult = async (decodedText: string) => {
    setScanResult(decodedText);
    
    try {
      // Busca el QR en la base de datos local
      const foundQR = await qrDatabase.findQRByContent(decodedText);
      if (foundQR) {
        // Si existe, lo marca como verificado y muestra info
        setQrInfo(foundQR);
        setIsVerified(true);
      } else {
        // Si no existe, lo marca como no verificado
        setQrInfo(null);
        setIsVerified(false);
      }
    } catch (error) {
      console.error('Error checking QR in database:', error);
      setIsVerified(false);
    }
  };

  // Abre el contenido del QR según su tipo (URL, email, teléfono, texto)
  const openContent = () => {
    if (!scanResult) return;

    if (scanResult.startsWith('http://') || scanResult.startsWith('https://')) {
      window.open(scanResult, '_blank');
    } else if (scanResult.includes('@') && scanResult.includes('.')) {
      window.open(`mailto:${scanResult}`, '_blank');
    } else if (scanResult.startsWith('+') || /^\d+$/.test(scanResult.replace(/[\s-()]/g, ''))) {
      window.open(`tel:${scanResult}`, '_blank');
    } else {
      // For text content, copy to clipboard
      navigator.clipboard.writeText(scanResult).then(() => {
        alert('Texto copiado al portapapeles');
      });
    }
  };

  // Resetea el estado del escáner para leer otro QR
  const resetScanner = () => {
    setScanResult('');
    setQrInfo(null);
    setIsVerified(null);
    setError('');
    stopScanning();
  };

  // Limpia recursos de la cámara al desmontar el componente
  React.useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <Camera className="mr-3" size={24} />
          Escanear Código QR
        </h2>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {!isScanning && !scanResult && (
          <div className="space-y-6">
            {/* Camera Scanner */}
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-8 mb-4">
                <Camera className="w-24 h-24 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Escanea códigos QR usando tu cámara
                </p>
                <button
                  onClick={startCameraScanning}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-500 transition-all"
                >
                  Iniciar Cámara
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-8">
                <Upload className="w-24 h-24 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  O sube una imagen con código QR
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-400 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-500 transition-all"
                >
                  Subir Imagen
                </button>
              </div>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg bg-black"
                style={{ aspectRatio: '1' }}
              />
            </div>
            <div className="text-center">
              <button
                onClick={stopScanning}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Detener Escáner
              </button>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resultado del Escaneo</h3>
              {/* Loader mientras se verifica el QR */}
              {isVerified === null && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                  <span className="text-gray-400">Verificando QR...</span>
                </div>
              )}
              {/* Mostrar resultado solo cuando isVerified ya tiene valor */}
              {isVerified !== null && (
                <>
                  {isVerified === true && qrInfo ? (
                    <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="text-green-400 mr-2" size={20} />
                        <span className="text-green-400 font-semibold">QR Verificado</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-400">Nombre:</span> <span className="text-white">{qrInfo.name}</span></p>
                        <p><span className="text-gray-400">Autor:</span> <span className="text-white">{qrInfo.author}</span></p>
                        <p><span className="text-gray-400">Tipo:</span> <span className="text-white">{qrInfo.type}</span></p>
                        <p><span className="text-gray-400">Creado:</span> <span className="text-white">{new Date(qrInfo.createdAt).toLocaleDateString()}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="text-red-400 mr-2" size={20} />
                        <span className="text-red-400 font-semibold">Este QR no está verificado</span>
                      </div>
                      <p className="text-red-300 text-sm">
                        Ingrese bajo su propio riesgo.
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-gray-300 text-sm mb-2">Contenido:</p>
                <p className="text-white font-mono break-all text-sm">{scanResult}</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={openContent}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-500 transition-all flex items-center justify-center"
                >
                  <ExternalLink className="mr-2" size={16} />
                  Abrir Contenido
                </button>
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Escanear Otro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerComponent;