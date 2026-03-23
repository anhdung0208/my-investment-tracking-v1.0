export function PriceCard({ title, price, unit = '', trend = 'down', change = '' }) {
  const isObject = typeof price === 'object' && price !== null;

  const renderTrend = () => (
    <div className="mt-4 pt-3 border-t border-zinc-50 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <div className={`w-1 h-1 rounded-full ${trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <span className="text-[9px] font-bold text-zinc-400 truncate max-w-[80px]">
          {change}
        </span>
      </div>
      <div
        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
          trend === 'up'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-600'
        }`}
      >
        <span className="text-[9px] font-black">{trend === 'up' ? '▲' : '▼'}</span>
        <span className="text-[8px] font-bold uppercase">
          {trend === 'up' ? 'Tăng' : 'Giảm'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-orange-100 p-4 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300">
      <p className="text-orange-600 text-[9px] font-bold uppercase mb-3 tracking-widest opacity-70">
        {title}
      </p>

      {isObject ? (
        <div className="grid grid-cols-2 gap-2">
          {/* Buy */}
          <div className="flex flex-col space-y-0.5">
            <p className="text-zinc-400 text-[8px] uppercase font-bold">Mua</p>
            <span className="text-xl font-bold text-zinc-800 tracking-tighter">
              {price.buy || '---'}
            </span>
            <span className="text-[9px] text-zinc-500">
              Qua: {price.oldBuy || '---'}
            </span>
          </div>

          {/* Sell */}
          <div className="flex flex-col space-y-0.5 border-l border-orange-50 pl-3">
            <p className="text-orange-500 text-[8px] uppercase font-bold">Bán</p>
            <span className="text-xl font-black text-orange-600 tracking-tighter">
              {price.sell || '---'}
            </span>
            <span className="text-[9px] text-orange-600 font-bold">
              Qua: {price.oldSell || '---'}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-zinc-400 text-[8px] uppercase font-bold mb-1">
            Thế giới
          </p>
          <span className="text-2xl font-black text-zinc-900 tracking-tighter">
            {typeof price === 'number'
              ? price.toLocaleString('en-US')
              : price}
          </span>
        </div>
      )}

      {renderTrend()}
    </div>
  );
}