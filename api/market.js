import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=30');
  const url = "https://www.24h.com.vn/gia-vang-hom-nay-c425.html";
  const apiKey = process.env.VITE_GOLD_API_KEY;

  try {
    const [worldRes, domesticRes] = await Promise.allSettled([
      axios.get('https://www.goldapi.io/api/XAU/USD', { headers: { 'x-access-token': apiKey }, timeout: 5000 }),
      axios.get(url, { headers: { "User-Agent": "Mozilla/5.0..." }, timeout: 8000 })
    ]);

    let responseData = {
      world: { price: 0, trend: 'neutral', change: '0%' },
      sjc: { buy: '---', sell: '---', diff: '0' },
      pnj: { buy: '---', sell: '---', diff: '0' },
      doji: { buy: '---', sell: '---', diff: '0' },
      chartData: [],
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    };

    if (domesticRes.status === 'fulfilled') {
      const $ = cheerio.load(domesticRes.value.data);
      $('table tr').each((_, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 3) {
          const name = $(cols[0]).text().trim();
          
          // Hàm tách: Lấy dòng đầu là Giá, dòng cuối là Biến động
          const parseData = (text) => {
            const parts = text.split('\n').map(p => p.trim()).filter(p => p !== "");
            return {
              price: parts[0] || '---',
              diff: parts[parts.length - 1] || '0'
            };
          };

          const buyData = parseData($(cols[1]).text());
          const sellData = parseData($(cols[2]).text());

          // Con số 5000 thường là của cả phiên, mình lấy từ cột Bán làm chuẩn
          const item = { 
            buy: buyData.price, 
            sell: sellData.price, 
            diff: sellData.diff // Con số 5000 Dũng cần
          };

          if (name.includes("SJC TP.HCM")) responseData.sjc = item;
          if (name.includes("PNJ TP.HCM")) responseData.pnj = item;
          if (name.includes("DOJI TP.HCM")) responseData.doji = item;
        }
      });
      
      // Tạo Chart data giả lập (giữ nguyên)
      const base = parseFloat(responseData.sjc.sell.replace(',', '.')) || 82;
      responseData.chartData = Array.from({length: 15}, (_, i) => ({
        date: `${i+1}/3`,
        price: (base - (Math.random() * 2)).toFixed(2)
      }));
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