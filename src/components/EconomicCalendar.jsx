import React, { useEffect, useRef } from "react";

export default function EconomicCalendar() {
  const container = useRef();

  useEffect(() => {
    if (container.current) container.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "light",
      "isTransparent": false,
      "width": "100%",
      "height": 600,
      "locale": "vi",
      "importanceFilter": "-1,0,1", // Hiện tất cả các tin từ nhẹ đến mạnh
      "currencyFilter": "USD,EUR,JPY,VND" // Tập trung vào các đồng tiền chính
    });
    container.current.appendChild(script);
  }, []);

  return (
    <div className="bg-white p-4 rounded-[32px] border border-orange-100 shadow-sm overflow-hidden h-[680px]">
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Lịch sự kiện kinh tế</h3>
      </div>
      <div ref={container} className="tradingview-widget-container"></div>
    </div>
  );
}