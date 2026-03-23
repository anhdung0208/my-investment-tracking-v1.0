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

  // 1. Kiểm tra trạng thái Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <span className="ml-3 text-zinc-400">Đang tải dữ liệu thị trường...</span>
      </div>
    );
  }

  // 2. Render khi đã có data
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PriceCard 
          title="Vàng Thế Giới" 
          price={data?.world?.price} 
          unit={data?.world?.unit} 
          trend={data?.world?.trend} 
          change={data?.world?.change} 
        />
        <PriceCard 
          title="Vàng SJC (Bán)" 
          price={data?.sjc?.sell} 
          unit="tr/lượng" 
          trend="up" 
          change="SJC HCM" 
        />
        <PriceCard 
          title="Tỷ giá USD" 
          price={data?.usd?.rate} 
          unit="VND" 
          trend="up" 
          change="Vietcombank" 
        />
      </div>
      
      <div className="text-right text-[10px] text-zinc-600 italic">
        Cập nhật cuối: {data?.updatedAt}
      </div>
    </div>
  );
}