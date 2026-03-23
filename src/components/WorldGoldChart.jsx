import React, { useEffect, useRef } from 'react';

export default function WorldGoldChart() {
  const container = useRef();

  useEffect(() => {
    // Kiểm tra xem script đã tồn tại chưa để tránh load trùng lặp
    if (!document.getElementById('tradingview-widget-script')) {
      const script = document.createElement("script");
      script.id = 'tradingview-widget-script';
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            "autosize": true,
            "symbol": "OANDA:XAUUSD", // Mã vàng thế giới chuẩn
            "interval": "H",         // Mặc định xem theo giờ (H) hoặc ngày (D)
            "timezone": "Asia/Ho_Chi_Minh",
            "theme": "light",
            "style": "3",            // Kiểu biểu đồ vùng (Area) cho đồng bộ với Recharts
            "locale": "vi_VN",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "hide_top_toolbar": false,
            "save_image": false,
            "container_id": "tradingview_gold_chart"
          });
        }
      };
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-white p-4 rounded-[32px] border border-orange-100 shadow-sm overflow-hidden h-[500px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Phân tích kỹ thuật thế giới (XAU/USD)</h3>
      </div>
      <div id="tradingview_gold_chart" className="h-[420px]" ref={container}></div>
    </div>
  );
}