import React, { useEffect, useRef } from "react";

export default function TechnicalGauge() {
  const container = useRef();

  useEffect(() => {
    if (container.current) container.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "interval": "1h",
      "width": "100%",
      "isTransparent": false,
      "height": 450,
      "symbol": "OANDA:XAUUSD", // Phân tích Vàng thế giới
      "showIntervalTabs": true,
      "displayMode": "single",
      "locale": "vi",
      "colorTheme": "light"
    });
    container.current.appendChild(script);
  }, []);

  return (
    <div className="bg-white p-4 rounded-[32px] border border-orange-100 shadow-sm overflow-hidden h-[520px]">
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="w-1.5 h-5 bg-red-500 rounded-full"></div>
        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Xu hướng Kỹ thuật (XAU/USD)</h3>
      </div>
      <div ref={container} className="tradingview-widget-container"></div>
    </div>
  );
}