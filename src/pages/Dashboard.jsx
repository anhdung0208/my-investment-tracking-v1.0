import React, { Suspense } from "react";
import useSWR from "swr";
import { RefreshCw, TrendingUp, Globe, Clock, ShieldCheck } from "lucide-react";
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
import Skeleton from "../components/Skeleton";
import { fetchGoldPrices } from "../services/gold";
import WorldGoldChart from "../components/WorldGoldChart";
import ForexRatesWidget from "../components/ForexRatesWidget";

// Lazy load heavy widgets
const StockWatchlistWidget = React.lazy(() => import("../components/StockWatchlistWidget"));
const TechnicalGauge = React.lazy(() => import("../components/TechnicalGauge"));
const EconomicCalendar = React.lazy(() => import("../components/EconomicCalendar"));

// =======================
// TOOLTIP
// =======================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const value = payload?.[0]?.value;

    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-orange-100 ring-1 ring-black/5">
        <p className="text-[10px] text-zinc-400 font-black uppercase mb-2 tracking-tighter">
          Thời điểm: {label}
        </p>
        <p className="text-orange-600 font-black text-xl flex items-baseline gap-1">
          {typeof value === "number" ? value.toLocaleString("en-US") : "--"}
          <span className="text-xs text-orange-400 font-bold">đ</span>
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

  const goldList = [
    { key: "sjc", title: "SJC Toàn Quốc" },
    { key: "dojiSg", title: "DOJI Sài Gòn" },
    { key: "dojiHn", title: "DOJI Hà Nội" },
    { key: "btmh", title: "Bảo Tín Minh Châu" },
  ];

  const isLoading = !data && !error;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            Thị trường trực tuyến
          </h2>
          <p className="text-zinc-500 text-xs font-medium mt-1 uppercase tracking-wider">
            Dữ liệu cập nhật thời gian thực từ các sàn giao dịch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
            <ShieldCheck className="w-3 h-3" />
            KẾT NỐI AN TOÀN
          </div>

          <button
            onClick={handleRefresh}
            disabled={isValidating}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[11px] shadow-sm transition-all active:scale-95
            ${isValidating
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100 ring-1 ring-orange-200/50"
              }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {isValidating ? "ĐANG CẬP NHẬT..." : "LÀM MỚI DỮ LIỆU"}
          </button>
        </div>
      </div>

      {/* QUICK STATS / CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {goldList.map((item) => (
          <PriceCard
            key={item.key}
            title={item.title}
            price={data?.[item.key]}
            unit="đ"
            loading={isLoading}
          />
        ))}
      </div>

      {/* CHART SECTION */}
      <div className="bg-white p-8 rounded-[40px] border border-orange-100 shadow-xl shadow-orange-900/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                Diễn biến giá SJC Niêm yết
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold">LỊCH SỬ BIẾN ĐỘNG 30 NGÀY QUA</p>
            </div>
          </div>
          <span className="text-[10px] text-white bg-orange-500 px-3 py-1 rounded-full font-black shadow-lg shadow-orange-500/20">
            LIVE: 24H.COM.VN
          </span>
        </div>

        <div className="h-[320px] w-full relative z-10">
          {isLoading ? (
            <div className="w-full h-full flex flex-col gap-4">
              <Skeleton className="w-full h-full rounded-3xl" />
            </div>
          ) : (
            <ResponsiveContainer>
              <AreaChart data={data?.chartData || []}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="date"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />

                <YAxis hide domain={["dataMin - 1000", "dataMax + 1000"]} />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }} />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#ea580c"
                  strokeWidth={4}
                  fill="url(#colorPrice)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* GLOBAL + TECH */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-6 px-1">
          <Globe className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest">
            Phân tích quốc tế & Kỹ thuật
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WorldGoldChart />
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <TechnicalGauge />
            </Suspense>
          </div>
        </div>
      </div>

      {/* FOREX + ECONOMIC */}
      <div className="pt-4">
        <h3 className="text-xs font-black uppercase text-zinc-500 mb-6 px-1 tracking-widest">
          Ngoại tệ & Kinh tế vĩ mô
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ForexRatesWidget />
          </div>

          <div className="lg:col-span-2">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <EconomicCalendar />
            </Suspense>
          </div>
        </div>
      </div>

      {/* STOCK */}
      <div className="pt-4">
        <h3 className="text-xs font-black uppercase text-zinc-500 mb-6 px-1 tracking-widest">
          Theo dõi Thị trường Chứng khoán
        </h3>

        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <StockWatchlistWidget />
        </Suspense>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-8 border-t border-zinc-100 mt-12 bg-zinc-50/50 rounded-[32px]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-black tracking-widest">
            <div className={`w-2 h-2 rounded-full ${isValidating ? 'bg-orange-400 animate-pulse' : 'bg-emerald-500'}`} />
            {isValidating ? "ĐANG ĐỒNG BỘ..." : "DỮ LIỆU ĐANG TRỰC TUYẾN"}
          </span>
          <span className="text-[10px] text-zinc-300 font-bold">|</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">VERSION 1.2.0</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">Cập nhật lúc:</span>
          <span className="text-[10px] text-zinc-800 font-black font-mono">
            {data?.displayTime ? `${data.displayTime} (Hôm nay)` : "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
}

