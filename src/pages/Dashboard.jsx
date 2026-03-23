import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PriceCard } from "../components/PriceCard";
import { fetchGoldPrices } from '../services/gold';

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
        <span className="ml-3 text-zinc-400 font-medium">Đang cào dữ liệu 24h...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PriceCard 
          title="Vàng Thế Giới" 
          price={data?.world?.price} 
          unit="USD/oz" 
          trend={data?.world?.trend} 
          change={data?.world?.change} 
        />
        <PriceCard 
          title="SJC TP.HCM" 
          price={data?.sjc} 
          unit="tr/lượng" 
          trend={parseFloat(data?.sjc?.sell) >= parseFloat(data?.sjc?.oldSell) ? "up" : "down"} 
          change="So với hôm qua" 
        />
        <PriceCard 
          title="PNJ TP.HCM" 
          price={data?.pnj} 
          unit="tr/lượng" 
          trend={parseFloat(data?.pnj?.sell) >= parseFloat(data?.pnj?.oldSell) ? "up" : "down"} 
          change="So với hôm qua" 
        />
        <PriceCard 
          title="DOJI SG" 
          price={data?.doji} 
          unit="tr/lượng" 
          trend={parseFloat(data?.doji?.sell) >= parseFloat(data?.doji?.oldSell) ? "up" : "down"} 
          change="So với hôm qua" 
        />
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
            <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Biến động 30 ngày</h3>
          </div>
          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Dữ liệu: 24h.com.vn
          </span>
        </div>
        
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#94A3B8'}} dy={10} />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="price" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
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