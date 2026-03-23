import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=30');
  const apiKey = process.env.VITE_GOLD_API_KEY;

  try {
    const [worldRes, domesticRes] = await Promise.allSettled([
      axios.get('https://www.goldapi.io/api/XAU/USD', { headers: { 'x-access-token': apiKey }, timeout: 5000 }),
      axios.get('https://giavang.net/', { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000 }) // Sửa lại URL nguồn
    ]);

    let responseData = {
      world: { price: 0, trend: 'neutral', change: '0%' },
      sjc: { buy: '---', sell: '---', diff: 0 },
      dojiHn: { buy: '---', sell: '---', diff: 0 },
      dojiSg: { buy: '---', sell: '---', diff: 0 },
      btmh: { buy: '---', sell: '---', diff: 0 },
      chartData: [],
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    };

    if (domesticRes.status === 'fulfilled') {
      const $ = cheerio.load(domesticRes.value.data);
      
      $('table tr').each((_, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 3) {
          const name = $(cols[0]).text().trim();
          
          // HÀM TÁCH THÔNG MINH: Đọc cả số và mã HTML để biết Tăng hay Giảm
          const parseRaw = (tdElement) => {
            const text = $(tdElement).text().trim();
            const lines = text.split('\n').map(l => l.trim()).filter(l => l !== "");
            const currentPrice = lines[0] || '---';
            
            // Lấy số 5000
            let diffNum = parseFloat((lines[lines.length - 1] || '0').replace(/[^\d.-]/g, '')) || 0;
            
            // Đọc HTML class để quyết định dấu Tăng/Giảm
            const htmlContent = $(tdElement).html() || "";
            const isDown = htmlContent.includes('down') || htmlContent.includes('red') || htmlContent.includes('giảm');
            
            if (isDown) diffNum = -Math.abs(diffNum); // Nếu là giảm, ép thành số âm (-5000)

            return { current: currentPrice, diff: diffNum };
          };

          const buyData = parseRaw(cols[1]);  // Truyền nguyên cục HTML
          const sellData = parseRaw(cols[2]); // Truyền nguyên cục HTML

          const item = { 
            buy: buyData.current, 
            sell: sellData.current, 
            diff: sellData.diff // Truyền con số (vd: 5000 hoặc -5000)
          };

          if (name === "SJC") responseData.sjc = item;
          else if (name.includes("DOJI HN")) responseData.dojiHn = item;
          else if (name.includes("DOJI SG")) responseData.dojiSg = item;
          else if (name.includes("BTMH") || name.includes("Bảo Tín")) responseData.btmh = item;
        }
      });
    }

    // World Data...
    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = { price: d.price, trend: d.chp > 0 ? 'up' : 'down', change: `${d.chp?.toFixed(2)}%` };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}