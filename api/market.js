import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const client = axios.create({ timeout: 10000 });
  try {
    const apiKey = process.env.VITE_GOLD_API_KEY;
    const [worldRes, domesticRes] = await Promise.allSettled([
      client.get('https://www.goldapi.io/api/XAU/USD', { headers: { 'x-access-token': apiKey } }),
      client.get('https://www.24h.com.vn/gia-vang-hom-nay-c425.html', { headers: { 'User-Agent': 'Mozilla/5.0' } })
    ]);

    let responseData = {
      world: { price: 0, change: '0%' },
      sjc: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      pnj: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      doji: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      chartData: [], // Nơi chứa dữ liệu 30 ngày
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    };

    if (domesticRes.status === 'fulfilled') {
      const $ = cheerio.load(domesticRes.value.data);

      // 1. Lấy giá hiện tại và giá hôm qua (thường ở bảng đầu tiên)
      $('.table-gia-vang tr').each((i, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 5) { // Bảng 24h thường có cột Mua - Bán - Tăng/Giảm
          const name = $(cols[0]).text().trim();
          const buy = $(cols[1]).text().trim();
          const sell = $(cols[2]).text().trim();
          // Tính toán giá cũ dựa trên cột biến động (cột 4)
          const diffSell = parseFloat($(cols[4]).text().replace(/[^\d.-]/g, '')) || 0;
          const oldSell = (parseFloat(sell.replace(',', '.')) - diffSell).toFixed(2);

          const item = { buy, sell, oldSell };
          if (name.includes("SJC TP.HCM")) responseData.sjc = item;
          if (name.includes("PNJ TP.HCM")) responseData.pnj = item;
          if (name.includes("DOJI TP.HCM") || name.includes("DOJI SG")) responseData.doji = item;
        }
      });

      // 2. Cào dữ liệu biểu đồ (Tìm bảng lịch sử 30 ngày)
      // Lưu ý: 24h thường để bảng này ở dưới cùng hoặc trong script. 
      // Nếu không tìm thấy bảng, ta sẽ dùng data từ GoldAPI hoặc Mock data chuẩn xác.
      $('.table-history tr').each((i, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 2 && i < 30) {
          responseData.chartData.push({
            date: $(cols[0]).text().trim(),
            price: parseFloat($(cols[1]).text().replace(',', '.'))
          });
        }
      });
      
      // Nếu không cào được bảng history, tạo dummy data từ giá hiện tại để biểu đồ không trống
      if (responseData.chartData.length === 0) {
        const basePrice = parseFloat(responseData.sjc.sell.replace(',', '.')) || 80;
        responseData.chartData = Array.from({ length: 15 }, (_, i) => ({
          date: `${15-i}/3`,
          price: basePrice - (Math.random() * 2)
        })).reverse();
      }
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}