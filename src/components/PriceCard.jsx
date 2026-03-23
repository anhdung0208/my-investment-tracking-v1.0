import React from 'react';

export default function PriceCard({ title, price, unit, trend, change }) {
  const isObjectPrice = typeof price === 'object' && price !== null;

  // Xử lý con số diff (5000)
  const getChangeInfo = (diffValue) => {
    if (!diffValue || diffValue === '0' || diffValue === '---') return null;
    
    // Thường trang 24h dùng màu text hoặc icon để biết tăng/giảm, 
    // nhưng ở đây mình sẽ dựa vào trend từ API hoặc logic của Dũng
    const num = parseFloat(diffValue.replace(',', '.'));
    
    // Nếu Dũng muốn 5000 hiển thị thành 0.5 (triệu)
    const displayValue = (num / 10000).toFixed(1); 

    return {
      val: displayValue,
      isUp: trend === 'up', // Dựa vào trend truyền từ Dashboard
      isDown: trend === 'down'
    };
  };

  const changeInfo = isObjectPrice ? getChangeInfo(price.diff) : null;

  // Tính giá hôm qua: Giá hiện tại - Biến động
  const getOldPrice = (current, diff) => {
    const c = parseFloat(current?.replace(',', '.')) || 0;
    const d = (parseFloat(diff?.replace(',', '.')) / 10000) || 0;
    return (trend === 'up' ? c - d : c + d).toFixed(2);
  };

  return (
    <div className="bg-white border border-orange-100 p-4 rounded-[24px] shadow-sm hover:shadow-md transition-all">
      <p className="text-orange-600 text-[9px] font-bold uppercase mb-3 tracking-widest opacity-70">{title}</p>
      
      <div className="space-y-3">
        {isObjectPrice ? (
          <div className="grid grid-cols-2 gap-2">
            {/* Cột Mua */}
            <div className="flex flex-col">
              <p className="text-zinc-400 text-[8px] font-bold uppercase">Mua vào</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-zinc-800">{price.buy}</span>
                {changeInfo && (
                  <span className={`text-[10px] font-black ${changeInfo.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {changeInfo.isUp ? '▲' : '▼'}{changeInfo.val}
                  </span>
                )}
              </div>
              <p className="text-[8px] text-zinc-400">Qua: {getOldPrice(price.buy, price.diff)}</p>
            </div>

            {/* Cột Bán */}
            <div className="flex flex-col border-l border-orange-50 pl-3">
              <p className="text-orange-500 text-[8px] font-bold uppercase">Bán ra</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-orange-600">{price.sell}</span>
                {changeInfo && (
                  <span className={`text-[10px] font-black ${changeInfo.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {changeInfo.isUp ? '▲' : '▼'}{changeInfo.val}
                  </span>
                )}
              </div>
              <p className="text-[8px] text-zinc-400">Qua: {getOldPrice(price.sell, price.diff)}</p>
            </div>
          </div>
        ) : (
          /* Vàng Thế giới */
          <div className="flex flex-col">
            <p className="text-zinc-400 text-[8px] uppercase font-bold">Thế giới</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-zinc-900">{price}</span>
              <span className="text-zinc-500 text-[10px]">{unit}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-50 flex justify-between items-center text-[9px]">
        <span className="text-zinc-400 font-bold">{change}</span>
        <span className={`font-black ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend === 'up' ? 'TĂNG' : 'GIẢM'}
        </span>
      </div>
    </div>
  );
}