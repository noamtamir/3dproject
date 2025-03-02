import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import PromptPage from './pages/PromptPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import TrackingPage from './pages/TrackingPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <div className="gradient-bg fixed inset-0 z-0" />
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<PromptPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/track/:trackingNumber" element={<TrackingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;