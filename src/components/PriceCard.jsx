export default function PriceCard({ title, price, unit, trend, change }) {
  // price bây giờ sẽ có dạng: { buy: '82.1', sell: '84.1', oldBuy: '81.5', oldSell: '83.5' }
  const isObjectPrice = typeof price === 'object' && price !== null;

  return (
    <div className="bg-white border border-orange-100 p-5 rounded-[32px] shadow-sm hover:shadow-lg transition-all duration-300">
      <p className="text-orange-600 text-[10px] font-bold uppercase mb-4 tracking-widest opacity-80">{title}</p>
      
      <div className="space-y-4">
        {isObjectPrice ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Cột Mua vào */}
            <div className="flex flex-col space-y-1">
              <p className="text-zinc-400 text-[9px] uppercase font-bold">Mua vào</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-800 tracking-tight">{price.buy}</span>
                <span className="text-[10px] text-zinc-400 font-medium">{unit}</span>
              </div>
              {/* Giá hôm qua */}
              <div className="pt-1 flex items-center gap-1 opacity-60">
                <span className="text-[10px] text-zinc-400 font-medium">Hôm qua:</span>
                <span className="text-[10px] text-zinc-500 font-bold">{price.oldBuy || '---'}</span>
              </div>
            </div>

            {/* Cột Bán ra */}
            <div className="flex flex-col space-y-1 border-l border-orange-50 pl-4">
              <p className="text-orange-500 text-[9px] uppercase font-bold">Bán ra</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-orange-600 tracking-tight">{price.sell}</span>
                <span className="text-[10px] text-orange-400 font-medium">{unit}</span>
              </div>
              {/* Giá hôm qua */}
              <div className="pt-1 flex items-center gap-1 opacity-70">
                <span className="text-[10px] text-zinc-400 font-medium">Hôm qua:</span>
                <span className="text-[10px] text-orange-600 font-bold">{price.oldSell || '---'}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Vàng Thế Giới */
          <div className="flex flex-col">
            <p className="text-zinc-400 text-[9px] uppercase font-bold mb-1">Giá hiện tại</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                {typeof price === 'number' ? price.toLocaleString('en-US') : price}
              </span>
              <span className="text-zinc-500 text-xs font-medium">{unit}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
           <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
           <span className="text-[10px] font-bold text-zinc-500">{change}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <span className="text-[10px] font-black">{trend === 'up' ? '▲' : '▼'}</span>
          <span className="text-[9px] font-bold uppercase">{trend === 'up' ? 'Tăng' : 'Giảm'}</span>
        </div>
      </div>
    </div>
  );
}