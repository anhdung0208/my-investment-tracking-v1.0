const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const apiKey = process.env.VITE_GOLD_API_KEY;

    // 1. Vàng thế giới
    const worldRes = await axios.get('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': apiKey }
    });

    // 2. Vàng Việt Nam (SJC)
    const response24h = await axios.get('https://www.24h.com.vn/gia-vang-hom-nay-c425.html');
    const $ = cheerio.load(response24h.data);
    const sjcBuy = $('.table-gia-vang tr').eq(1).find('td').eq(1).text().trim() || "80.5";
    const sjcSell = $('.table-gia-vang tr').eq(1).find('td').eq(2).text().trim() || "83.5";

    res.status(200).json({
      world: { 
        price: worldRes.data.price, 
        unit: "USD/oz", 
        trend: worldRes.data.chp > 0 ? "up" : "down", 
        change: `${worldRes.data.chp?.toFixed(2)}%` 
      },
      sjc: { buy: sjcBuy, sell: sjcSell },
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};