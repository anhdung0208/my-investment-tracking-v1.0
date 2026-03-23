import React, { useEffect, useRef } from "react";

export default function StockWatchlistWidget() {
  const ref = useRef();

  useEffect(() => {
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.async = true;

    script.innerHTML = JSON.stringify({
      symbols: [
  { s: "FPT", d: "FPT" },
  { s: "HPG", d: "HPG" },
  { s: "VNM", d: "VNM" },
  { s: "VCB", d: "VCB" },
  { s: "MWG", d: "MWG" }
],
      chartOnly: false,
      width: "100%",
      height: 400,
      locale: "vi",
      colorTheme: "light",
    });

    ref.current.appendChild(script);
  }, []);

  return (
    <div className="bg-white p-4 rounded-[32px] border border-orange-100 shadow-sm">
      <h3 className="text-sm font-black mb-3">
        Cổ phiếu Việt Nam
      </h3>

      <div ref={ref} />
    </div>
  );
}