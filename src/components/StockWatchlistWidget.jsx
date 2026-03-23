import React, { useEffect, useRef } from "react";

export default function StockWatchlistWidget() {
  const ref = useRef();

  useEffect(() => {
    // Xóa nội dung cũ để tránh bị lặp widget khi hot-reload (rất quan trọng)
    if (ref.current) {
      ref.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.type = "text/javascript";

    script.innerHTML = JSON.stringify({
      "colorTheme": "light",
      "dateRange": "12M",
      "showChart": true,
      "locale": "vi",
      "width": "100%",
      "height": 400,
      "largeChartHeight": -1,
      "isTransparent": false,
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "tabs": [
        {
          "title": "Cổ phiếu Việt Nam",
          "symbols": [
            { "s": "HOSE:FPT", "d": "FPT" },
            { "s": "HOSE:HPG", "d": "Hòa Phát" },
            { "s": "HOSE:VNM", "d": "Vinamilk" },
            { "s": "HOSE:VCB", "d": "Vietcombank" },
            { "s": "HOSE:MWG", "d": "Thế giới Di động" }
          ]
        }
      ]
    });

    ref.current.appendChild(script);
  }, []);

  return (
    <div className="bg-white p-4 rounded-[32px] border border-orange-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="w-1.5 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">
          Cổ phiếu Việt Nam
        </h3>
      </div>

      <div className="tradingview-widget-container" ref={ref}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}