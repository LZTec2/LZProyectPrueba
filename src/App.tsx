import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import QRGenerator from './components/QRGenerator';
import QRScanner from './components/QRScanner';
import QRGallery from './components/QRGallery';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-black">
          <Header />
          <main className="py-8">
            <Routes>
              <Route path="/" element={<QRGenerator />} />
              <Route path="/scan" element={<QRScanner />} />
              <Route path="/gallery" element={<QRGallery />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;