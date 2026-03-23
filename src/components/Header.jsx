import { TrendingUp, Wallet } from 'lucide-react';

export default function Header() {
  return (
    <nav className="flex justify-between items-center mb-8 pb-6 border-b border-orange-100">
      <div className="flex items-center gap-3">
        <div className="bg-orange-500 p-2.5 rounded-2xl shadow-lg shadow-orange-200">
          <TrendingUp className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">
            Investment
          </h1>
          <p className="text-[10px] text-orange-500 font-bold tracking-[0.2em] uppercase">
            Market Realtime
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-xs font-bold text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-full">
          {new Date().toLocaleDateString('vi-VN')}
        </span>

        <button className="bg-white border border-orange-100 p-2.5 rounded-2xl text-orange-500 shadow-sm hover:bg-orange-50 transition-colors">
          <Wallet size={20} />
        </button>
      </div>
    </nav>
  );
}