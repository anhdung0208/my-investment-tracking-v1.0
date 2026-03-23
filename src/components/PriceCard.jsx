// components/PriceCard.jsx
export default function PriceCard({ title, price, unit, trend, change }) {
  // price bây giờ có thể là Object {buy, sell} hoặc số đơn lẻ
  const isObjectPrice = typeof price === 'object' && price !== null;

  return (
    <div className="bg-white border border-orange-100 p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all">
      <p className="text-orange-600 text-[11px] font-bold uppercase mb-4 tracking-widest">{title}</p>
      
      <div className="space-y-4">
        {isObjectPrice ? (
          <>
            {/* Giá Bán - Ưu tiên to nhất */}
            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1">Bán ra</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-zinc-900 tracking-tighter">
                  {price.sell}
                </span>
                <span className="text-zinc-500 text-xs font-medium">{unit}</span>
              </div>
            </div>

            {/* Giá Mua - Nhỏ hơn và màu nhẹ hơn */}
            <div className="pt-3 border-t border-orange-50">
              <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1">Mua vào</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-orange-500 tracking-tight">
                  {price.buy}
                </span>
                <span className="text-zinc-400 text-[10px]">{unit}</span>
              </div>
            </div>
          </>
        ) : (
          /* Cho Vàng Thế Giới (giá đơn) */
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-zinc-900 tracking-tighter">
                {typeof price === 'number' ? price.toLocaleString('en-US') : price}
              </span>
              <span className="text-zinc-500 text-xs font-medium">{unit}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
          trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
        }`}>
          {trend === 'up' ? '↗' : '↘'} {change}
        </span>
      </div>
    </div>
  );
}