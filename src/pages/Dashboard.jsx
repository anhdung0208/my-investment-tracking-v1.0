import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceCard } from '../components/PriceCard';
import { Header } from '../components/Header';
import { fetchGoldPrices } from '../services/gold';

const getTrend = (sell, oldSell) => {
  const s = parseFloat(String(sell).replace(/[^\d.]/g, '')) || 0;
  const o = parseFloat(String(oldSell).replace(/[^\d.]/g, '')) || 0;
  return s >= o ? 'up' : 'down';
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoldPrices()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!data) return <div className="p-10">No data</div>;

  return (
    <div className="p-6 space-y-6">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PriceCard
          title="World"
          price={data.world.price}
          trend={data.world.trend}
          change={data.world.change}
        />

        <PriceCard
          title="SJC"
          price={data.sjc}
          trend={getTrend(data.sjc.sell, data.sjc.oldSell)}
          change="vs yesterday"
        />

        <PriceCard
          title="PNJ"
          price={data.pnj}
          trend={getTrend(data.pnj.sell, data.pnj.oldSell)}
          change="vs yesterday"
        />

        <PriceCard
          title="DOJI"
          price={data.doji}
          trend={getTrend(data.doji.sell, data.doji.oldSell)}
          change="vs yesterday"
        />
      </div>

      <div className="bg-white p-4 rounded-xl">
        <h3 className="mb-3">Chart 30 days</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={data.chartData || []}>
              <XAxis dataKey="date" />
              <Tooltip />
              <Area dataKey="price" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}