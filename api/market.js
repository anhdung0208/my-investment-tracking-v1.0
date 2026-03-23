import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Tạo một client với timeout ngắn để không bị treo server
  const client = axios.create({ timeout: 7000 }); 

  try {
    const apiKey = process.env.VITE_GOLD_API_KEY;

    // CHẠY SONG SONG: Đây là chìa khóa để giảm từ 17s xuống ~3s
    const [worldRes, domesticRes] = await Promise.allSettled([
      client.get('https://www.goldapi.io/api/XAU/USD', {
        headers: { 'x-access-token': apiKey }
      }),
      client.get('https://www.24h.com.vn/gia-vang-hom-nay-c425.html', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      })
    ]);

    let responseData = {
      world: { price: 0, trend: 'neutral', change: '0%' },
      sjc: { buy: '---', sell: '---' },
      pnj: { buy: '---', sell: '---' },
      doji: { buy: '---', sell: '---' },
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    };

    // 1. Xử lý GoldAPI (Thế giới)
    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = {
        price: d.price,
        trend: d.chp > 0 ? 'up' : 'down',
        change: `${d.chp?.toFixed(2)}%`
      };
    }

    // 2. Xử lý 24h (Trong nước) - Logic n8n của Dũng
    if (domesticRes.status === 'fulfilled') {
      const $ = cheerio.load(domesticRes.value.data);
      $('table tr').each((_, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 3) {
          const name = $(cols[0]).text().trim();
          const buy = $(cols[1]).text().trim();
          const sell = $(cols[2]).text().trim();

          if (name.includes("SJC TP.HCM") || name === "SJC") responseData.sjc = { buy, sell };
          if (name.includes("PNJ TP.HCM")) responseData.pnj = { buy, sell };
          if (name.includes("DOJI TP.HCM") || name.includes("DOJI SG")) responseData.doji = { buy, sell };
        }
      });
    }

    // Trả về dữ liệu (Dù 1 trong 2 API lỗi thì vẫn có dữ liệu của thằng còn lại)
    return res.status(200).json(responseData);

  } catch (error) {
    return res.status(500).json({ error: "Lỗi xử lý", message: error.message });
  }
}