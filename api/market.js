import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.VITE_GOLD_API_KEY;

    // 1. Lấy giá thế giới từ GoldAPI
    const worldRes = await axios.get('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': apiKey }
    });

    // 2. Cào dữ liệu từ 24h.com.vn (Dùng logic giống n8n của Dũng)
    const { data } = await axios.get("https://www.24h.com.vn/gia-vang-hom-nay-c425.html", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    
    const $page = cheerio.load(data);
    let sjcData = { buy: "N/A", sell: "N/A" };
    let pnjData = { buy: "N/A", sell: "N/A" };

    $page('table tr').each((index, element) => {
      const columns = $page(element).find('td');
      if (columns.length >= 3) {
        const name = $page(columns[0]).text().trim();
        const buy = $page(columns[1]).text().trim();
        const sell = $page(columns[2]).text().trim();

        // Lọc đúng thương hiệu như Dũng yêu cầu ở n8n
        if (name.includes("SJC TP.HCM") || name === "SJC") {
          sjcData.buy = buy;
          sjcData.sell = sell;
        }
        if (name.includes("PNJ TP.HCM")) {
          pnjData.buy = buy;
          pnjData.sell = sell;
        }
      }
    });

    // 3. Trả về JSON tổng hợp cho React
    return res.status(200).json({
      world: {
        price: worldRes.data.price,
        trend: worldRes.data.chp > 0 ? "up" : "down",
        change: `${worldRes.data.chp?.toFixed(2)}%`
      },
      sjc: sjcData,
      pnj: pnjData,
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}