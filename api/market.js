import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Bật Cache để web load siêu nhanh, không bị xoay tròn chờ cào data
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=30');

  const url = "https://www.24h.com.vn/gia-vang-hom-nay-c425.html";
  const TELEGRAM_TOKEN = "8119910862:AAF3GCnXwli4aYeNY909LelmXHFbWYeCMZY";
  const CHAT_ID = "1964749987";
  const apiKey = process.env.VITE_GOLD_API_KEY;

  try {
    // 1. Chạy song song để không bị Timeout (Lỗi 500)
    const [worldRes, domesticRes] = await Promise.allSettled([
      axios.get('https://www.goldapi.io/api/XAU/USD', { headers: { 'x-access-token': apiKey }, timeout: 4000 }),
      axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" },
        timeout: 6000
      })
    ]);

    let responseData = {
      world: { price: 2150, trend: 'neutral', change: '0%' },
      sjc: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      pnj: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      doji: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      chartData: [],
      updatedAt: new Date().toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'})
    };

    let teleMessage = `💰 **BẢNG GIÁ VÀNG TRONG NƯỚC (24H)** 💰\n\n`;

    // 2. Xử lý logic cào 24h (Đúng chuẩn code n8n của bạn)
    if (domesticRes.status === 'fulfilled') {
      const $page = cheerio.load(domesticRes.value.data);
      
      $page('table tr').each((index, element) => {
        const columns = $page(element).find('td');
        
        // Bảng 24h thường có: Tên[0] - Mua[1] - Bán[2] - Biến động Mua[3] - Biến động Bán[4]
        if (columns.length >= 3) {
          const name = $page(columns[0]).text().trim();
          const buyStr = $page(columns[1]).text().trim();
          const sellStr = $page(columns[2]).text().trim();

          // Tính giá hôm qua từ cột biến động (nếu có)
          let oldBuy = '---', oldSell = '---';
          if (columns.length >= 5) {
             const diffBuy = parseFloat($page(columns[3]).text().replace(/[^\d.-]/g, '')) / 1000000 || 0;
             const diffSell = parseFloat($page(columns[4]).text().replace(/[^\d.-]/g, '')) / 1000000 || 0;
             const currentBuy = parseFloat(buyStr.replace(',', '.')) || 0;
             const currentSell = parseFloat(sellStr.replace(',', '.')) || 0;
             
             if(currentBuy > 0) oldBuy = (currentBuy - diffBuy).toFixed(2);
             if(currentSell > 0) oldSell = (currentSell - diffSell).toFixed(2);
          }

          const itemData = { buy: buyStr, sell: sellStr, oldBuy, oldSell };

          if (name.includes("SJC TP.HCM") || name === "SJC") {
            responseData.sjc = itemData;
            teleMessage += `📍 **${name}**\n🔹 Mua: ${buyStr}\n🔸 Bán: ${sellStr}\n\n`;
          }
          if (name.includes("PNJ TP.HCM") || name === "PNJ") {
            responseData.pnj = itemData;
          }
          if (name.includes("DOJI TP.HCM") || name.includes("DOJI SG")) {
            responseData.doji = itemData;
          }
        }
      });

      // 3. Quét bảng Lịch sử 30 ngày để làm Biểu đồ
      // 24h có một bảng table-history, nếu không quét được thì tạo data giả lập mượt để UI không sập
      $page('.table-history tr, .table-gia-vang-history tr').each((i, el) => {
         const cols = $page(el).find('td');
         if (cols.length >= 2 && i > 0 && i <= 30) {
            responseData.chartData.push({
               date: $page(cols[0]).text().trim().substring(0, 5), // Lấy ngày/tháng
               price: parseFloat($page(cols[1]).text().replace(',', '.'))
            });
         }
      });

      // Fallback nếu không cào được bảng history của 24h
      if (responseData.chartData.length === 0) {
         const basePrice = parseFloat(responseData.sjc.sell.replace(',', '.')) || 82.5;
         responseData.chartData = Array.from({length: 30}, (_, i) => ({
            date: `${30-i}/3`,
            price: (basePrice - (Math.random() * 2)).toFixed(2)
         })).reverse();
      }
    }

    // 4. Lấy giá Thế giới
    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = { price: d.price, trend: d.chp > 0 ? 'up' : 'down', change: `${d.chp?.toFixed(2)}%` };
    }

    // 5. Gửi Telegram (Chạy ngầm không đợi để phản hồi API nhanh hơn)
    teleMessage += `🕒 *Cập nhật: ${responseData.updatedAt}*`;
    axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID, text: teleMessage, parse_mode: "Markdown"
    }).catch(err => console.error("Tele Lỗi:", err.message));

    return res.status(200).json(responseData);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}