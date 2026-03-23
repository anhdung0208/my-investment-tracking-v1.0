import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10">
        <div className="max-w-6xl mx-auto">
          <Header />
          <main className="mt-4">
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