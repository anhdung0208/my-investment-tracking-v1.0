import React, { useEffect, useRef } from 'react';

export default function StockWatchlistWidget() {
  const container = useRef();

  useEffect(() => {
    if (container.current) container.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        "autosize": true,
        "symbol": "HOSE:FPT", // Mã mặc định khi mở lên
        "interval": "D",
        "timezone": "Asia/Ho_Chi_Minh",
        "theme": "light",
        "style": "1",
        "locale": "vi_VN",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true, 
        "container_id": "advanced_chart"
      });
    };
    container.current.appendChild(script);
  }, []);

  return (
    <div className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm h-[600px]">
      <div id="advanced_chart" className="h-full" ref={container}></div>
    </div>
  );
}