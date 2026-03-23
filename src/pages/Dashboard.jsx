import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PriceCard from "../components/PriceCard";
import { fetchGoldPrices } from '../services/gold';

// Component tùy chỉnh Tooltip cho biểu đồ đẹp hơn
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-orange-50">
        <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">{label}</p>
        <p className="text-orange-600 font-black text-lg">
          {payload[0].value.toFixed(2)} <span className="text-[10px] text-orange-400 font-semibold">tr/lượng</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const res = await fetchGoldPrices();
      if (res) setData(res);
      setLoading(false);
    };
    getData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-zinc-400 font-medium">Đang cào dữ liệu 24h.com.vn...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 3. DOJI Sài Gòn */}
        <PriceCard 
          title="DOJI Sài Gòn" 
          price={data?.dojiSg} 
          unit="đ" 
          change="Live từ 24h.com.vn" 
        />
        
        {/* 1. SJC */}
        <PriceCard 
          title="SJC Toàn Quốc" 
          price={data?.sjc} 
          unit="đ" 
          change="Live từ 24h.com.vn" 
        />

        {/* 2. DOJI HN */}
        <PriceCard 
          title="DOJI Hà Nội" 
          price={data?.dojiHn} 
          unit="đ" 
          change="Live từ 24h.com.vn" 
        />

        {/* 4. Bảo Tín Minh Châu (BTMH) */}
        <PriceCard 
          title="Bảo Tín Minh Châu" 
          price={data?.btmh} 
          unit="đ" 
          change="Live từ 24h.com.vn" 
        />
      </div>
      
      {/* PHẦN BIỂU ĐỒ NÂNG CẤP */}
      <div className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm overflow-hidden relative">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
            <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Lịch sử 30 ngày</h3>
          </div>
          <span className="text-[9px] font-bold text-orange-600 bg-orange-50/80 px-3 py-1.5 rounded-full border border-orange-100/50 backdrop-blur-sm">
            Nguồn: 24h.com.vn
          </span>
        </div>
        
        <div className="h-[280px] w-full -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.4}/>
                  <stop offset="75%" stopColor="#f97316" stopOpacity={0.05}/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                tick={{fill: '#94a3b8', fontWeight: 600}} 
                dy={15} 
                minTickGap={20} // Tránh các ngày bị dính chữ vào nhau
              />
              {/* Căn chỉnh Domain thông minh hơn để chart có độ nhấp nhô đẹp */}
              <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fdba74', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#ea580c" 
                strokeWidth={4} // Nét đậm hơn
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                activeDot={{ r: 6, fill: "#ea580c", stroke: "#fff", strokeWidth: 3, shadow: "0px 0px 10px rgba(234, 88, 12, 0.5)" }} // Dot đẹp khi hover
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Footer giữ nguyên */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Live Market Data</span>
        </div>
        <div className="text-[10px] text-zinc-600 italic font-mono">
          Cập nhật: {data?.updatedAt}
        </div>
      </div>
    </div>
  );
}