import React from 'react';

export default function PriceCard({ title, price, unit, trend, change }) {
  const isObjectPrice = typeof price === 'object' && price !== null;

  // Tính toán dựa trên biến unit (biến động)
  const getChangeData = (currentPrice, changeValue) => {
    if (!currentPrice || currentPrice === '---') return null;
    
    // Chuyển đổi string sang number để tính toán
    const current = parseFloat(currentPrice.toString().replace(',', '.'));
    const diff = parseFloat(changeValue?.toString().replace(',', '.')) || 0;
    
    if (isNaN(current)) return null;

    return {
      oldPrice: (current - diff).toFixed(2), // Giá hôm qua = Hiện tại - Biến động
      diffValue: Math.abs(diff).toFixed(2),
      isUp: diff > 0,
      isDown: diff < 0,
      sign: diff > 0 ? '+' : '-'
    };
  };

  const buyInfo = isObjectPrice ? getChangeData(price.buy, unit) : null;
  const sellInfo = isObjectPrice ? getChangeData(price.sell, unit) : null;

  return (
    <div className="bg-white border border-orange-100 p-4 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300">
      <p className="text-orange-600 text-[9px] font-bold uppercase mb-3 tracking-widest opacity-70">
        {title}
      </p>
      
      <div className="space-y-3">
        {isObjectPrice ? (
          <div className="grid grid-cols-2 gap-2">
            {/* Cột Mua vào */}
            <div className="flex flex-col space-y-0.5">
              <p className="text-zinc-400 text-[8px] uppercase font-bold">Mua vào</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-zinc-800 tracking-tighter">{price.buy}</span>
                {/* Hiển thị unit (biến động) ngay cạnh giá chính */}
                {buyInfo && buyInfo.diffValue !== "0.00" && (
                  <span className={`text-[10px] font-black ${buyInfo.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {buyInfo.sign}{buyInfo.diffValue}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-60">
                <span className="text-[8px] text-zinc-400">Qua:</span>
                <span className="text-[9px] text-zinc-600 font-semibold">
                  {buyInfo ? buyInfo.oldPrice : '---'}
                </span>
              </div>
            </div>

            {/* Cột Bán ra */}
            <div className="flex flex-col space-y-0.5 border-l border-orange-50 pl-3">
              <p className="text-orange-500 text-[8px] uppercase font-bold">Bán ra</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-orange-600 tracking-tighter">{price.sell}</span>
                {/* Hiển thị unit (biến động) ngay cạnh giá chính */}
                {sellInfo && sellInfo.diffValue !== "0.00" && (
                  <span className={`text-[10px] font-black ${sellInfo.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {sellInfo.sign}{sellInfo.diffValue}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-60">
                <span className="text-[8px] text-zinc-400">Qua:</span>
                <span className="text-[9px] text-orange-600 font-bold">
                  {sellInfo ? sellInfo.oldPrice : '---'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Vàng Thế giới */
          <div className="flex flex-col">
            <p className="text-zinc-400 text-[8px] uppercase font-bold mb-0.5">Thế giới</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-zinc-900 tracking-tighter">
                {typeof price === 'number' ? price.toLocaleString('en-US') : price}
              </span>
              <span className="text-zinc-500 text-[10px] font-medium ml-1">{unit}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Card */}
      <div className="mt-4 pt-3 border-t border-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
           <div className={`w-1 h-1 rounded-full ${trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
           <span className="text-[9px] font-bold text-zinc-400 truncate max-w-[80px]">{change}</span>
        </div>
        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <span className="text-[9px] font-black">{trend === 'up' ? '▲' : '▼'}</span>
          <span className="text-[8px] font-bold uppercase">{trend === 'up' ? 'Tăng' : 'Giảm'}</span>
        </div>
      </div>
    </div>
  );
}