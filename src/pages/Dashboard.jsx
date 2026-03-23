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
      {/* Thay đổi grid-cols để hiển thị 4 cột trên màn hình lớn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Vàng Thế Giới */}
        <PriceCard 
          title="Vàng Thế Giới" 
          price={data?.world?.price} 
          unit="USD/oz" 
          trend={data?.world?.trend} 
          change={data?.world?.change} 
        />

        {/* 2. Vàng SJC - Lấy dữ liệu cào */}
        <PriceCard 
          title="SJC TP.HCM" 
          price={data?.sjc?.sell} 
          unit="tr/lượng" 
          trend={data?.sjc?.sell > data?.sjc?.buy ? "up" : "down"} 
          change={`Mua: ${data?.sjc?.buy}`} 
        />

        {/* 3. Vàng PNJ - Lấy dữ liệu cào */}
        <PriceCard 
          title="PNJ TP.HCM" 
          price={data?.pnj?.sell} 
          unit="tr/lượng" 
          trend="up" 
          change={`Mua: ${data?.pnj?.buy}`} 
        />

        {/* 4. Vàng DOJI SG - Lấy dữ liệu cào */}
        <PriceCard 
          title="DOJI SG" 
          price={data?.doji?.sell} 
          unit="tr/lượng" 
          trend="up" 
          change={`Mua: ${data?.doji?.buy}`} 
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
        <div className="text-[10px] text-zinc-600 italic font-mono">
          Cập nhật cuối: {data?.updatedAt}
        </div>
      </div>
    </div>
  );
}