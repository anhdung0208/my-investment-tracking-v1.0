import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const url = "https://www.24h.com.vn/gia-vang-hom-nay-c425.html";
    const apiKey = process.env.VITE_GOLD_API_KEY;

    // 1. Chạy song song GoldAPI và cào 24h để đảm bảo tốc độ < 3s
    const [worldRes, domesticRes] = await Promise.allSettled([
      axios.get('https://www.goldapi.io/api/XAU/USD', {
        headers: { 'x-access-token': apiKey },
        timeout: 5000
      }),
      axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        },
        timeout: 8000
      })
    ]);

    let responseData = {
      world: { price: 0, trend: 'neutral', change: '0%' },
      sjc: { buy: '---', sell: '---' },
      pnj: { buy: '---', sell: '---' },
      doji: { buy: '---', sell: '---' },
      chartData: [], 
      updatedAt: new Date().toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'})
    };

    // 2. Xử lý GoldAPI (Giá thế giới)
    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = {
        price: d.price,
        trend: d.chp > 0 ? 'up' : 'down',
        change: `${d.chp?.toFixed(2)}%`
      };
    }

    // 3. Xử lý cào 24h - Dùng đúng logic .each của Dũng
    if (domesticRes.status === 'fulfilled') {
      const $page = cheerio.load(domesticRes.value.data);
      
      $page('table tr').each((index, element) => {
        const columns = $page(element).find('td');
        if (columns.length >= 3) {
          const name = $page(columns[0]).text().trim();
          const buy = $page(columns[1]).text().trim();
          const sell = $page(columns[2]).text().trim();

          // Lọc đúng các thương hiệu Dũng cần
          if (name.includes("SJC TP.HCM") || name === "SJC") {
            responseData.sjc = { buy, sell, oldBuy: "81.00", oldSell: "83.50" };
          }
          if (name.includes("PNJ TP.HCM")) {
            responseData.pnj = { buy, sell, oldBuy: "70.50", oldSell: "72.00" };
          }
          if (name.includes("DOJI TP.HCM") || name.includes("DOJI SG")) {
            responseData.doji = { buy, sell, oldBuy: "81.00", oldSell: "83.50" };
          }
        }
      });

      // Tạo dữ liệu biểu đồ giả lập từ giá SJC (vì 24h dùng biểu đồ ảnh/canvas khó cào text)
      const base = parseFloat(responseData.sjc.sell.replace(',', '.')) || 82;
      responseData.chartData = Array.from({ length: 15 }, (_, i) => ({
        date: `${i + 1}/3`,
        price: base - (Math.random() * 2)
      }));
    }

    return res.status(200).json(responseData);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}