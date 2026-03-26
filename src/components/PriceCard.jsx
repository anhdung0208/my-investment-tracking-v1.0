import React from "react";
import Skeleton from "./Skeleton";

export default function PriceCard({ title, price, unit, loading }) {
  if (loading) {
    return (
      <div className="bg-white border border-orange-100 p-4 rounded-[24px] shadow-sm">
        <Skeleton className="w-20 h-3 mb-3" />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Skeleton className="w-10 h-2 mb-2" />
              <Skeleton className="w-16 h-6" />
            </div>
            <div className="border-l border-orange-50 pl-3">
              <Skeleton className="w-10 h-2 mb-2" />
              <Skeleton className="w-16 h-6" />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-50 flex justify-between">
          <Skeleton className="w-16 h-2" />
          <Skeleton className="w-10 h-3" />
        </div>
      </div>
    );
  }

  const isObjectPrice = typeof price === "object" && price !== null && !Array.isArray(price);

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
      sign: isUp ? "▲" : "▼",
    };
  };

  const buyChange = isObjectPrice ? getChangeInfo(price.buyDiff) : null;
  const sellChange = isObjectPrice ? getChangeInfo(price.sellDiff) : null;

  // trend dựa theo SELL cho nội địa, hoặc change cho thế giới
  let cardTrend = "neutral";
  if (isObjectPrice) {
    cardTrend = sellChange?.isUp === true ? "up" : sellChange?.isUp === false ? "down" : "neutral";
  } else if (price && typeof price === 'object' && price.trend) {
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
    <div className="group bg-white border border-orange-100 p-4 rounded-[24px] shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
          {title}
        </p>
        {cardTrend !== "neutral" && (
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${cardTrend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        )}
      </div>

      <div className="space-y-4">
        {isObjectPrice ? (
          <div className="grid grid-cols-2 gap-3">
            {/* BUY */}
            <div className="flex flex-col">
              <p className="text-zinc-400 text-[9px] font-bold uppercase mb-1">
                Mua vào
              </p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xl font-bold text-zinc-800 tracking-tight">
                  {formatNumber(price.buy)}
                </span>
                {buyChange && (
                  <span className={`text-[9px] font-black ${buyChange.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                    {buyChange.sign}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[9px] text-zinc-400 font-medium">Hôm qua:</span>
                <span className="text-[9px] text-zinc-500 font-bold">
                  {getOldPrice(price.buy, price.buyDiff)}
                </span>
              </div>
            </div>

            {/* SELL */}
            <div className="flex flex-col border-l border-orange-50 pl-3">
              <p className="text-orange-500 text-[9px] font-bold uppercase mb-1">
                Bán ra
              </p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xl font-black text-orange-600 tracking-tight">
                  {formatNumber(price.sell)}
                </span>
                {sellChange && (
                  <span className={`text-[9px] font-black ${sellChange.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                    {sellChange.sign}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[9px] text-zinc-400 font-medium">Hôm qua:</span>
                <span className="text-[9px] text-zinc-500 font-bold">
                  {getOldPrice(price.sell, price.sellDiff)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // WORLD GOLD (hoặc giá trị đơn lẻ)
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-zinc-900 tracking-tighter">
                  {typeof price === "object" ? formatNumber(price.price) : formatNumber(price)}
                </span>
                <span className="text-orange-500 font-bold text-[11px] uppercase">
                  {unit}
                </span>
              </div>
              
              {price?.change && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${price.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {price.trend === 'up' ? '+' : ''}{price.change}
                </span>
              )}
            </div>
            
            <p className="text-zinc-400 text-[9px] font-medium">
              Thị trường quốc tế (Real-time)
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-4 pt-3 border-t border-zinc-50 flex justify-between items-center text-[9px]">
        <span className="text-zinc-400 font-bold tracking-tight">
          Nguồn: {isObjectPrice ? "24h.com.vn" : "GoldAPI.io"}
        </span>

        {cardTrend !== "neutral" && (
          <span className={`font-black uppercase px-2 py-0.5 rounded-lg text-[8px] ${
            cardTrend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {cardTrend === "up" ? "Tăng" : "Giảm"}
          </span>
        )}
      </div>
    </div>
  );
}