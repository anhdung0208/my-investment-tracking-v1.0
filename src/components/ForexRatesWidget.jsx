import React, { useEffect, useRef } from 'react';

export default function ForexRatesWidget() {
  const container = useRef();

  useEffect(() => {
    // Tạo script để nhúng Widget của TradingView
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "light",
      "dateRange": "12M",
      "showChart": true,
      "locale": "vi_VN",
      "width": "100%",
      "height": "400",
      "largeChartHeight": -1,
      "isTransparent": false,
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "tabs": [
        {
          "title": "Ngoại tệ phổ biến",
          "symbols": [
            { "s": "FX_IDC:USDVND", "d": "USD / VND" },
            { "s": "FX:EURUSD", "d": "EUR / USD" },
            { "s": "FX:USDJPY", "d": "USD / JPY" },
            { "s": "FX:GBPUSD", "d": "GBP / USD" },
            { "s": "FX_IDC:JPYVND", "d": "JPY / VND" }
          ]
        }
      ]
    });
    container.current.appendChild(script);
  }, []);

  return (
    <div className="bg-white p-4 rounded-[32px] border border-orange-100 shadow-sm overflow-hidden mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-5 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full"></div>
        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Tỷ giá ngoại tệ trực tuyến</h3>
      </div>
      <div className="tradingview-widget-container" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}