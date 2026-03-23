import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const client = axios.create({ timeout: 8000 });
  try {
    const apiKey = process.env.VITE_GOLD_API_KEY;
    const url = "https://giavang.net/"; // Nguồn mới theo ảnh của bạn

    const [worldRes, domesticRes] = await Promise.allSettled([
      client.get('https://www.goldapi.io/api/XAU/USD', { headers: { 'x-access-token': apiKey } }),
      client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    ]);

    let responseData = {
      world: { price: 0, trend: 'neutral', change: '0%' },
      sjc: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      pnj: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      doji: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      chartData: [],
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    };

    if (domesticRes.status === 'fulfilled') {
      const $ = cheerio.load(domesticRes.value.data);
      
      $('table tr').each((_, el) => {
        const cols = $(el).find('td');
        // Theo ảnh image_59d39e.png:
        // Cột 0: Tên | Cột 1: Mua hôm nay | Cột 2: Bán hôm nay | Cột 3: Mua hôm qua | Cột 4: Bán hôm qua
        if (cols.length >= 5) {
          const name = $(cols[0]).text().trim();
          
          const item = {
            buy: $(cols[1]).text().split('\n')[0].trim(),   // Lấy số dòng trên
            sell: $(cols[2]).text().split('\n')[0].trim(),  // Lấy số dòng trên
            oldBuy: $(cols[3]).text().trim(),               // Cột "Giá mua" của "Hôm qua"
            oldSell: $(cols[4]).text().trim()               // Cột "Giá bán" của "Hôm qua"
          };

          if (name.includes("SJC")) responseData.sjc = item;
          if (name.includes("PNJ")) responseData.pnj = item;
          if (name.includes("DOJI SG") || name.includes("DOJI TP.HCM")) responseData.doji = item;
        }
      });

      // Lấy dữ liệu biểu đồ từ script hoặc bảng history nếu có, 
      // nếu không có dùng data từ GoldAPI để vẽ chart 30 ngày thế giới
      if (worldRes.status === 'fulfilled') {
         // Logic tạo chart data từ worldRes hoặc mock data để test
         responseData.chartData = Array.from({length: 20}, (_, i) => ({
            date: `${i+1}/3`,
            price: 2150 + Math.random() * 50
         }));
      }
    }

    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = { price: d.price, trend: d.chp > 0 ? 'up' : 'down', change: `${d.chp?.toFixed(2)}%` };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}