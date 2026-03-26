import React from "react";
import Skeleton from "./Skeleton";

export default function PriceCard({ title, price, unit, loading }) {
  if (loading) {
    return (
      <div className="bg-white border border-orange-100 p-5 rounded-[28px] shadow-sm">
        <Skeleton className="w-24 h-3.5 mb-4" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="w-12 h-2.5 mb-2.5" />
              <Skeleton className="w-20 h-7" />
            </div>
            <div className="border-l border-orange-50 pl-4">
              <Skeleton className="w-12 h-2.5 mb-2.5" />
              <Skeleton className="w-20 h-7" />
            </div>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-zinc-50 flex justify-between">
          <Skeleton className="w-20 h-2.5" />
          <Skeleton className="w-12 h-3.5" />
        </div>
      </div>
    );
  }

  const isObjectPrice = typeof price === "object" && price !== null && !Array.isArray(price) && price.buy !== undefined;

  // ========================
  // FORMAT NUMBER
  // ========================
  const formatNumber = (val) => {
    if (val === undefined || val === null || val === "---") return "---";
    const num = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
    return isNaN(num) ? "---" : num.toLocaleString("en-US");
  };

  // ========================
  // CHANGE INFO
  // ========================
  const getChangeInfo = (diffValue) => {
    if (diffValue === null || diffValue === undefined || diffValue === 0) return null;

    const isUp = diffValue > 0;
    const displayValue = Math.abs(diffValue).toLocaleString("en-US");

    return {
      val: displayValue,
      isUp,
      sign: isUp ? "+" : "-",
      color: isUp ? "text-emerald-600" : "text-rose-600",
      bg: isUp ? "bg-emerald-50" : "bg-rose-50",
    };
  };

  const buyChange = isObjectPrice ? getChangeInfo(price.buyDiff) : null;
  const sellChange = isObjectPrice ? getChangeInfo(price.sellDiff) : null;

  // trend dựa theo SELL cho nội địa, hoặc change cho thế giới
  let cardTrend = "neutral";
  if (isObjectPrice) {
    cardTrend = (price.sellDiff > 0) ? "up" : (price.sellDiff < 0) ? "down" : "neutral";
  } else if (typeof price === 'object' && price !== null && price.trend) {
    cardTrend = price.trend;
  }

  // ========================
  // OLD PRICE
  // ========================
  const getOldPrice = (currentStr, diffNum) => {
    if (!currentStr || currentStr === "---") return "---";

    const current = typeof currentStr === 'number' ? currentStr : parseFloat(String(currentStr).replace(/,/g, ""));
    if (isNaN(current)) return "---";

    const diff = diffNum || 0;
    const oldPrice = current - diff;

    return oldPrice.toLocaleString("en-US");
  };

  return (
    <div className="group bg-white border border-orange-100 p-5 rounded-[28px] shadow-sm hover:shadow-2xl hover:border-orange-200 transition-all duration-500 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <p className="text-orange-600 text-[11px] font-black uppercase tracking-[0.15em] opacity-80 group-hover:opacity-100 transition-opacity">
          {title}
        </p>
        {cardTrend !== "neutral" && (
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${cardTrend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {cardTrend === 'up' ? 'Tăng' : 'Giảm'}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isObjectPrice ? (
          <div className="flex space-x-3 sm:space-x-4">
            {/* BUY */}
            <div className="flex-1 flex flex-col">
              <p className="text-zinc-400 text-[9px] sm:text-[10px] font-bold uppercase mb-1 sm:mb-1.5 tracking-tight">
                Mua vào
              </p>

              <div className="flex items-baseline flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5 mb-1 sm:mb-1.5 min-w-0">
                <span className="text-lg sm:text-xl xl:text-2xl font-black text-zinc-900 tracking-tighter truncate">
                  {formatNumber(price.buy)}
                </span>
                {buyChange && (
                  <span className={`text-[9px] sm:text-[11px] font-black whitespace-nowrap ${buyChange.color}`}>
                    {buyChange.sign}{buyChange.val}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
                <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">Hôm qua:</span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold truncate">
                  {getOldPrice(price.buy, price.buyDiff)}
                </span>
              </div>
            </div>

            {/* SELL */}
            <div className="flex-1 flex flex-col border-l border-orange-50 pl-3 sm:pl-4">
              <p className="text-orange-500 text-[9px] sm:text-[10px] font-bold uppercase mb-1 sm:mb-1.5 tracking-tight">
                Bán ra
              </p>

              <div className="flex items-baseline flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5 mb-1 sm:mb-1.5 min-w-0">
                <span className="text-lg sm:text-xl xl:text-2xl font-black text-orange-600 tracking-tighter truncate">
                  {formatNumber(price.sell)}
                </span>
                {sellChange && (
                  <span className={`text-[9px] sm:text-[11px] font-black whitespace-nowrap ${sellChange.color}`}>
                    {sellChange.sign}{sellChange.val}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
                <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">Hôm qua:</span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold truncate">
                  {getOldPrice(price.sell, price.sellDiff)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // WORLD GOLD
          <div className="flex flex-col">
            <div className="flex items-baseline flex-wrap gap-x-4 justify-between mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                  {typeof price === "object" ? formatNumber(price.price) : formatNumber(price)}
                </span>
                <span className="text-orange-500 font-black text-[13px] uppercase">
                  {unit}
                </span>
              </div>
              
              {price?.change && (
                <div className={`px-2 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 ${price.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {price.trend === 'up' ? '▲' : '▼'} {price.change}
                </div>
              )}
            </div>
            
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              Thị trường quốc tế (Real-time)
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-5 pt-4 border-t border-zinc-50 flex justify-between items-center text-[10px]">
        <span className="text-zinc-400 font-bold tracking-tight">
          Nguồn: {isObjectPrice ? "24h.com.vn" : "GoldAPI.io"}
        </span>

        <div className={`w-2 h-2 rounded-full ${cardTrend === 'up' ? 'bg-emerald-500' : cardTrend === 'down' ? 'bg-rose-500' : 'bg-zinc-200'}`} />
      </div>
    </div>
  );
}
