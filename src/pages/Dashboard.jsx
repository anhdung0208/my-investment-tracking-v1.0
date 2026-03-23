import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import PriceCard from '../components/PriceCard';
import { fetchGoldPrices } from '../services/gold';

const getTrend = (sell, oldSell) => {
  const s = parseFloat(sell?.replace(/[^\d.]/g, '')) || 0;
  const o = parseFloat(oldSell?.replace(/[^\d.]/g, '')) || 0;
  return s >= o ? 'up' : 'down';
};

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

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-orange-500 rounded-full"></div>
        <span className="ml-3 text-zinc-400">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PriceCard
          title="Vàng Thế Giới"
          price={data.world.price}
          unit="USD/oz"
          trend={data.world.trend}
          change={data.world.change}
        />

        <PriceCard
          title="SJC"
          price={data.sjc}
          unit="tr/lượng"
          trend={getTrend(data.sjc.sell, data.sjc.oldSell)}
          change="So với hôm qua"
        />

        <PriceCard
          title="PNJ"
          price={data.pnj}
          unit="tr/lượng"
          trend={getTrend(data.pnj.sell, data.pnj.oldSell)}
          change="So với hôm qua"
        />

        <PriceCard
          title="DOJI"
          price={data.doji}
          unit="tr/lượng"
          trend={getTrend(data.doji.sell, data.doji.oldSell)}
          change="So với hôm qua"
        />
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm">
        <h3 className="text-sm font-bold mb-4">Biến động 30 ngày</h3>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis hide />
              <Tooltip />

              <Area
                type="monotone"
                dataKey="price"
                stroke="#f97316"
                fillOpacity={0.2}
                fill="#f97316"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between text-xs text-zinc-500">
        <span>Live Market</span>
        <span>Cập nhật: {data.updatedAt}</span>
      </div>
    </div>
  );
}