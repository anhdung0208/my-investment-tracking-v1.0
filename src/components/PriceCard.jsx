export default function PriceCard({ title, price, unit, trend, change }) {
  // Hàm định dạng số chuẩn VN
  const formatNum = (val) => {
    if (typeof val !== 'number') return val;
    return val.toLocaleString('vi-VN');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:border-amber-500/50 transition-colors">
      <p className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-mono font-bold text-white tracking-tighter">
          {formatNum(price)}
        </span>
        <span className="text-zinc-500 text-sm">{unit}</span>
      </div>
      <p className={`text-[10px] mt-3 font-bold px-2 py-1 rounded bg-opacity-10 inline-block ${
        trend === 'up' ? 'text-emerald-500 bg-emerald-500' : 'text-rose-500 bg-rose-500'
      }`}>
        {trend === 'up' ? '▲' : '▼'} {change}
      </p>
    </div>
  );
}