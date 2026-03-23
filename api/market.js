import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.VITE_GOLD_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Chưa cấu hình VITE_GOLD_API_KEY trên Vercel" });
    }

    // 1. Lấy giá vàng thế giới
    const worldRes = await axios.get('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': apiKey },
      timeout: 5000
    });

    // 2. Lấy giá vàng SJC từ 24h (Dùng try-catch để an toàn)
    let sjcData = { buy: 80.5, sell: 82.5 };
    try {
      const response24h = await axios.get('https://www.24h.com.vn/gia-vang-hom-nay-c425.html', { timeout: 3000 });
      const $ = cheerio.load(response24h.data);
      const buyText = $('.table-gia-vang tr').eq(1).find('td').eq(1).text().trim();
      const sellText = $('.table-gia-vang tr').eq(1).find('td').eq(2).text().trim();
      
      if (buyText) sjcData.buy = parseFloat(buyText.replace(',', '.'));
      if (sellText) sjcData.sell = parseFloat(sellText.replace(',', '.'));
    } catch (e) {
      console.log("Không cào được 24h, dùng giá dự phòng SJC");
    }

    // 3. Trả về kết quả JSON
    return res.status(200).json({
      world: { 
        price: worldRes.data.price || 2175, 
        trend: worldRes.data.chp > 0 ? "up" : "down", 
        change: `${worldRes.data.chp?.toFixed(2) || 0}%` 
      },
      sjc: sjcData,
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    });

  } catch (error) {
    return res.status(500).json({ 
      error: "Lỗi kết nối GoldAPI", 
      message: error.message 
    });
  }
}