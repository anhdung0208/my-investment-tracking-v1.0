import React from "react";

export default function PriceCard({ title, price, unit }) {
  const isObjectPrice = typeof price === "object" && price !== null;

  // ========================
  // FORMAT NUMBER
  // ========================
  const formatNumber = (val) => {
    if (!val || val === "---") return "---";
    const num = parseFloat(String(val).replace(/,/g, ""));
    return isNaN(num) ? "---" : num.toLocaleString("en-US");
  };

  // ========================
  // CHANGE INFO
  // ========================
  const getChangeInfo = (diffValue) => {
    if (!diffValue) return null;

    const isUp = diffValue > 0;
    const displayValue = Math.abs(diffValue).toLocaleString("en-US");

    return {
      val: displayValue,
      isUp,
      sign: isUp ? "▲" : "▼",
    };
  };

  const changeInfo = isObjectPrice ? getChangeInfo(price.diff) : null;
  const cardTrend = changeInfo
    ? changeInfo.isUp
      ? "up"
      : "down"
    : "neutral";

  // ========================
  // OLD PRICE
  // ========================
  const getOldPrice = (currentStr, diffNum) => {
    if (!currentStr || currentStr === "---") return "---";

    const current = parseFloat(currentStr.replace(/,/g, ""));
    if (isNaN(current)) return "---";

    const diff = diffNum || 0;
    const oldPrice = current - diff;

    return oldPrice.toLocaleString("en-US");
  };

  return (
    <div className="bg-white border border-orange-100 p-4 rounded-[24px] shadow-sm hover:shadow-md transition-all">
      <p className="text-orange-600 text-[9px] font-bold uppercase mb-3 tracking-widest opacity-70">
        {title}
      </p>

      <div className="space-y-3">
        {isObjectPrice ? (
          <div className="grid grid-cols-2 gap-2">
            {/* BUY */}
            <div className="flex flex-col">
              <p className="text-zinc-400 text-[8px] font-bold uppercase">
                Mua vào
              </p>

              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-zinc-800">
                  {formatNumber(price.buy)}
                </span>

                {changeInfo && (
                  <span
                    className={`text-[10px] font-black ${
                      changeInfo.isUp
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {changeInfo.sign}
                    {changeInfo.val}
                  </span>
                )}
              </div>

              <p className="text-[8px] text-zinc-400">
                Qua:{" "}
                <span className="font-semibold text-zinc-600">
                  {getOldPrice(price.buy, price.diff)}
                </span>
              </p>
            </div>

            {/* SELL */}
            <div className="flex flex-col border-l border-orange-50 pl-3">
              <p className="text-orange-500 text-[8px] font-bold uppercase">
                Bán ra
              </p>

              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-orange-600">
                  {formatNumber(price.sell)}
                </span>

                {changeInfo && (
                  <span
                    className={`text-[10px] font-black ${
                      changeInfo.isUp
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {changeInfo.sign}
                    {changeInfo.val}
                  </span>
                )}
              </div>

              <p className="text-[8px] text-zinc-400">
                Qua:{" "}
                <span className="font-semibold text-zinc-600">
                  {getOldPrice(price.sell, price.diff)}
                </span>
              </p>
            </div>
          </div>
        ) : (
          // WORLD GOLD
          <div className="flex flex-col">
            <p className="text-zinc-400 text-[8px] uppercase font-bold">
              Thế giới
            </p>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-zinc-900">
                {typeof price === "number"
                  ? price.toLocaleString("en-US")
                  : price}
              </span>
              <span className="text-zinc-500 text-[10px]">
                {unit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-4 pt-3 border-t border-zinc-50 flex justify-between items-center text-[9px]">
        <span className="text-zinc-400 font-bold">
          Live từ 24h.com.vn
        </span>

        {cardTrend !== "neutral" && (
          <span
            className={`font-black uppercase px-2 py-0.5 rounded-md ${
              cardTrend === "up"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {cardTrend === "up" ? "▲ TĂNG" : "▼ GIẢM"}
          </span>
        )}
      </div>
    </div>
  );
}