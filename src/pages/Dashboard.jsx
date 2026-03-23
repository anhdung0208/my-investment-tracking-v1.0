import React, { useState, useEffect } from 'react';
import PriceCard from '../components/PriceCard';
import { fetchGoldPrices } from '../services/gold';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const res = await fetchGoldPrices();
      setData(res);
      setLoading(false);
    };
    getData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <span className="ml-3 text-zinc-400 font-medium">Đang kết nối dữ liệu thị trường...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vàng Thế Giới - Lấy từ GoldAPI */}
        <PriceCard 
          title="Vàng Thế Giới" 
          price={data?.world?.price} 
          unit="USD/oz" 
          trend={data?.world?.trend} 
          change={data?.world?.change} 
        />

        {/* Vàng SJC - Lấy từ dữ liệu cào 24h.com.vn */}
        <PriceCard 
          title="Vàng SJC (Bán ra)" 
          price={data?.sjc?.sell} 
          unit="tr/lượng" 
          trend="up" 
          change="SJC HCM (24h)" 
        />

        {/* Tỷ giá hoặc Vàng SJC (Mua vào) */}
        <PriceCard 
          title="Vàng SJC (Mua vào)" 
          price={data?.sjc?.buy} 
          unit="tr/lượng" 
          trend="down" 
          change="Cập nhật trực tiếp" 
        />
      </div>
      
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Dữ liệu thời gian thực</span>
        </div>
        <div className="text-[10px] text-zinc-600 italic">
          Cập nhật cuối: {data?.updatedAt}
        </div>
      </div>
    </div>
  );
}