import React from 'react';

export default function PriceCard({ title, price, unit, change }) {
  const isObjectPrice = typeof price === 'object' && price !== null;

  // Tính chênh lệch và Màu sắc
  const getChangeInfo = (diffValue) => {
    if (diffValue === undefined || diffValue === 0) return null;
    
    const isUp = diffValue > 0;
    
    // Hiển thị: 5000 -> "5,000" (Hoặc có thể chia 1000 tùy ý bạn)
    const displayValue = Math.abs(diffValue).toLocaleString('en-US'); 

    return { val: displayValue, isUp, sign: isUp ? '▲' : '▼' };
  };

  const changeInfo = isObjectPrice ? getChangeInfo(price.diff) : null;
  const cardTrend = changeInfo ? (changeInfo.isUp ? 'up' : 'down') : 'neutral';

  // Tính giá hôm qua CHUẨN TOÁN HỌC: Xóa dấu phẩy -> Trừ -> Thêm dấu phẩy lại
  const getOldPrice = (currentStr, diffNum) => {
    if (!currentStr || currentStr === '---') return '---';
    
    // "166,000" -> 166000
    const current = parseFloat(currentStr.replace(/,/g, '')) || 0; 
    const diff = diffNum || 0; // vd: 5000 hoặc -5000
    

    const oldPrice = current - diff;
    return oldPrice.toLocaleString('en-US'); // Format lại: 161,000
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
                    {changeInfo.sign}{changeInfo.val}
                  </span>
                )}
              </div>
              <p className="text-[8px] text-zinc-400">Qua: <span className="font-semibold text-zinc-600">{getOldPrice(price.buy, price.diff)}</span></p>
            </div>

            {/* Cột Bán */}
            <div className="flex flex-col border-l border-orange-50 pl-3">
              <p className="text-orange-500 text-[8px] font-bold uppercase">Bán ra</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-orange-600">{price.sell}</span>
                {changeInfo && (
                  <span className={`text-[10px] font-black ${changeInfo.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {changeInfo.sign}{changeInfo.val}
                  </span>
                )}
              </div>
              <p className="text-[8px] text-zinc-400">Qua: <span className="font-semibold text-zinc-600">{getOldPrice(price.sell, price.diff)}</span></p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <p className="text-zinc-400 text-[8px] uppercase font-bold">Thế giới</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-zinc-900">{typeof price === 'number' ? price.toLocaleString('en-US') : price}</span>
              <span className="text-zinc-500 text-[10px]">{unit}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-50 flex justify-between items-center text-[9px]">
        <span className="text-zinc-400 font-bold">{change}</span>
        {cardTrend !== 'neutral' && (
          <span className={`font-black uppercase px-2 py-0.5 rounded-md ${cardTrend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {cardTrend === 'up' ? '▲ TĂNG' : '▼ GIẢM'}
          </span>
        )}
      </div>
    </div>
  );
}