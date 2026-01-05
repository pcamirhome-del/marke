
import React, { useRef, useEffect, useState } from 'react';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedValue, setScannedValue] = useState('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("لا يمكن الوصول للكاميرا. يرجى التحقق من صلاحيات المتصفح.");
      }
    };

    startCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (scannedValue) onScan(scannedValue);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden text-right">
        <div className="p-4 flex justify-between items-center bg-gray-800 text-white flex-row-reverse">
          <h3 className="font-bold flex items-center flex-row-reverse">
            <Camera size={20} className="ml-2" />
            <span>ماسح الباركود الذكي</span>
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center">
          {error ? (
            <div className="text-red-400 p-4 text-center">{error}</div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 border-2 border-indigo-500 border-dashed m-12 opacity-50"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            </>
          )}
        </div>

        <div className="p-6 bg-gray-800">
          <p className="text-gray-400 text-sm mb-4 text-center">
            وجه الكاميرا نحو الباركود أو أدخله يدوياً بالأسفل
          </p>
          <form onSubmit={handleManualEntry} className="flex space-x-2 flex-row-reverse">
            <button 
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-bold transition-colors mr-2"
            >
              بحث
            </button>
            <input
              autoFocus
              type="text"
              className="flex-1 bg-gray-700 border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
              placeholder="أدخل الباركود يدوياً..."
              value={scannedValue}
              onChange={(e) => setScannedValue(e.target.value)}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
