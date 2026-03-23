import { TrendingUp, Wallet } from 'lucide-react';

export default function Header() {
  return (
    <nav className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <div className="bg-amber-500 p-2 rounded-lg">
          <TrendingUp className="text-black" size={20} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight uppercase">Dung Investment</h1>
      </div>
      <div className="flex items-center gap-4 text-zinc-400">
        <span className="text-sm">23/03/2026</span>
        <button className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700">
          <Wallet size={18} />
        </button>
      </div>
    </nav>
  );
}