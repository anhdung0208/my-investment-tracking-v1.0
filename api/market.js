const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    // 1. Kiểm tra API Key có tồn tại không
    const apiKey = process.env.VITE_GOLD_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Thanh niên ơi, chưa có API Key trên Vercel!" });
    }

    // 2. Gọi GoldAPI (Vàng thế giới)
    const worldRes = await axios.get('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': apiKey },
      timeout: 5000 // Chờ tối đa 5s
    });

    // 3. Lấy giá SJC (Dùng try-catch riêng để nếu 24h lỗi thì vẫn hiện vàng thế giới)
    let sjcData = { buy: "80.5", sell: "82.5" };
    try {
      const response24h = await axios.get('https://www.24h.com.vn/gia-vang-hom-nay-c425.html', { timeout: 3000 });
      const $ = cheerio.load(response24h.data);
      sjcData.buy = $('.table-gia-vang tr').eq(1).find('td').eq(1).text().trim() || "80.5";
      sjcData.sell = $('.table-gia-vang tr').eq(1).find('td').eq(2).text().trim() || "82.5";
    } catch (e) {
      console.log("Lỗi cào 24h, dùng giá mặc định");
    }

    // 4. Trả về kết quả
    return res.status(200).json({
      world: { 
        price: worldRes.data.price || 2175, 
        trend: worldRes.data.chp > 0 ? "up" : "down", 
        change: `${worldRes.data.chp?.toFixed(2) || 0}%` 
      },
      sjc: { 
        buy: parseFloat(sjcData.buy.replace(',', '.')), 
        sell: parseFloat(sjcData.sell.replace(',', '.')) 
      },
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    });

  } catch (error) {
    // Trả về lỗi chi tiết để mình sửa tiếp
    return res.status(500).json({ 
      error: "Lỗi Backend rồi Dũng ơi!", 
      detail: error.message 
    });
  }
};