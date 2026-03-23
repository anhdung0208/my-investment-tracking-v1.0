import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      {/* Đổi từ bg-zinc-950 sang bg-orange-50 (màu trắng cam cực nhẹ) */}
      <div className="min-h-screen bg-[#FDFCFB] text-zinc-900 p-6 sm:p-10 font-sans">
        <div className="max-w-6xl mx-auto">
          <Header />
          <main className="mt-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<div className="p-10">Trang cá nhân</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;