import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Giới hạn timeout 7s để không bị Vercel ngắt kết nối cưỡng ép
  const client = axios.create({ timeout: 7000 }); 

  try {
    const apiKey = process.env.VITE_GOLD_API_KEY;

    // GỌI SONG SONG 2 NGUỒN (Tiết kiệm cực nhiều thời gian)
    const [worldRes, domesticRes] = await Promise.allSettled([
      client.get('https://www.goldapi.io/api/XAU/USD', {
        headers: { 'x-access-token': apiKey }
      }),
      client.get('https://www.24h.com.vn/gia-vang-hom-nay-c425.html', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
    ]);

    let responseData = {
      world: { price: 2175, trend: 'up', change: '0.1%' }, // Data dự phòng
      sjc: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      pnj: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      doji: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      chartData: Array.from({length: 15}, (_, i) => ({ date: `${i+1}/3`, price: 80 + Math.random() })),
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    };

    // 1. Xử lý GoldAPI
    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = { price: d.price, trend: d.chp > 0 ? 'up' : 'down', change: `${d.chp?.toFixed(2)}%` };
    }

    // 2. Xử lý dữ liệu cào 24h
    if (domesticRes.status === 'fulfilled') {
      const $ = cheerio.load(domesticRes.value.data);
      $('table tr').each((_, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 3) {
          const name = $(cols[0]).text().trim();
          const buy = $(cols[1]).text().trim();
          const sell = $(cols[2]).text().trim();
          
          // Logic lấy giá (Lưu ý: Bạn có thể cào giá cũ từ cột biến động)
          const item = { buy, sell, oldBuy: buy, oldSell: sell }; 
          if (name.includes("SJC TP.HCM")) responseData.sjc = item;
          if (name.includes("PNJ TP.HCM")) responseData.pnj = item;
          if (name.includes("DOJI TP.HCM") || name.includes("DOJI SG")) responseData.doji = item;
        }
      });
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}