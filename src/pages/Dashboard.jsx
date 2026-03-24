import React, { Suspense } from "react";
import useSWR from "swr";
import { RefreshCw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import PriceCard from "../components/PriceCard";
import { fetchGoldPrices } from "../services/gold";
import WorldGoldChart from "../components/WorldGoldChart";
import ForexRatesWidget from "../components/ForexRatesWidget";

// Lazy load heavy widgets
const StockWatchlistWidget = React.lazy(() =>
  import("../components/StockWatchlistWidget")
);
const TechnicalGauge = React.lazy(() =>
  import("../components/TechnicalGauge")
);
const EconomicCalendar = React.lazy(() =>
  import("../components/EconomicCalendar")
);

// =======================
// TOOLTIP
// =======================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const value = payload?.[0]?.value;

    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow border border-orange-50">
        <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">
          {label}
        </p>
        <p className="text-orange-600 font-black text-lg">
          {typeof value === "number"
            ? value.toLocaleString("en-US")
            : "--"}{" "}
          <span className="text-[10px] text-orange-400 font-semibold">
            đ
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data, error, mutate, isValidating } = useSWR(
    "gold-prices",
    fetchGoldPrices,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const handleRefresh = async () => {
    await mutate();
  };

  if (!data && !error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-zinc-400 font-medium">
          Đang tải dữ liệu...
        </span>
      </div>
    );
  }

  const goldList = [
    { key: "dojiSg", title: "DOJI Sài Gòn" },
    { key: "sjc", title: "SJC Toàn Quốc" },
    { key: "dojiHn", title: "DOJI Hà Nội" },
    { key: "btmh", title: "Bảo Tín Minh Châu" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-black text-zinc-800 uppercase tracking-tighter">
          Bảng tin thị trường
        </h2>

        <button
          onClick={handleRefresh}
          disabled={isValidating}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-[11px]
          ${
            isValidating
              ? "bg-zinc-100 text-zinc-400"
              : "bg-orange-50 text-orange-600 hover:bg-orange-100"
          }`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isValidating ? "animate-spin" : ""
            }`}
          />
          {isValidating ? "Đang cập nhật..." : "Làm mới"}
        </button>
      </div>

      {/* PRICE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {goldList.map((item) => (
          <PriceCard
            key={item.key}
            title={item.title}
            price={data?.[item.key]}
            unit="đ"
          />
        ))}
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-zinc-800 uppercase">
            Lịch sử SJC 30 ngày
          </h3>
          <span className="text-[9px] text-orange-600 font-bold">
            24h.com.vn
          </span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer>
            <AreaChart data={data?.chartData || []}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />

              <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="price"
                stroke="#ea580c"
                strokeWidth={3}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GLOBAL + TECH */}
      <div>
        <h3 className="text-xs font-black uppercase text-zinc-500 mb-3 px-1">
          Thị trường vàng thế giới
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WorldGoldChart />
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading...</div>}>
              <TechnicalGauge />
            </Suspense>
          </div>
        </div>
      </div>

      {/* FOREX + ECONOMIC */}
      <div>
        <h3 className="text-xs font-black uppercase text-zinc-500 mb-3 px-1">
          Ngoại tệ & Kinh tế vĩ mô
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ForexRatesWidget />
          </div>

          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading...</div>}>
              <EconomicCalendar />
            </Suspense>
          </div>
        </div>
      </div>

      {/* STOCK */}
      <div>
        <h3 className="text-xs font-black uppercase text-zinc-500 mb-3 px-1">
          Thị trường cổ phiếu
        </h3>

        <Suspense fallback={<div>Loading...</div>}>
          <StockWatchlistWidget />
        </Suspense>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center px-2 pt-6 border-t">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">
          {isValidating ? "Đang đồng bộ..." : "Live Market Data"}
        </span>

        <span className="text-[10px] text-zinc-600 font-mono">
          {data?.updatedAt || "--"}
        </span>
      </div>
    </div>
  );
}
