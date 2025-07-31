import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QrCode, Camera, GalleryVertical as Gallery } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Generar', icon: QrCode },
    { path: '/scan', label: 'Escanear', icon: Camera },
    { path: '/gallery', label: 'Galería', icon: Gallery },
  ];

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Check Code</h1>
          </div>
          
          <nav className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  location.pathname === path
                    ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;