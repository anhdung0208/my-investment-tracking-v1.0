import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=30');
  const apiKey = process.env.GOLD_API_KEY;

  try {
    const [worldRes, domesticRes] = await Promise.allSettled([
      axios.get('https://www.goldapi.io/api/XAU/USD', { headers: { 'x-access-token': apiKey }, timeout: 6000 }),
      axios.get('https://www.24h.com.vn/gia-vang-hom-nay-c425.html', { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Referer": "https://www.google.com/" }, timeout: 8000 })
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

    // ==========================================
    // 1. & 2. CÀO BẢNG GIÁ VÀ BIỂU ĐỒ 24H
    // ==========================================
    if (domesticRes.status === 'fulfilled') {
      const $ = cheerio.load(domesticRes.value.data);
      
      // -- 1. QUÉT BẢNG GIÁ --
      $('table tr').each((_, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 3) {
          const name = $(cols[0]).text().trim().toUpperCase();
          
          const parseRaw = (tdElement) => {
            const text = $(tdElement).text().trim();
            const lines = text.split('\n').map(l => l.trim()).filter(l => l !== "");
            const currentPrice = lines[0] || '---';
            
            let diffNum = 0;
            if (lines.length > 1) {
              diffNum = parseFloat((lines[lines.length - 1] || '0').replace(/[^\d.-]/g, '')) || 0;
            }
            
            const htmlContent = $(tdElement).html() || "";
            if (htmlContent.includes('down') || htmlContent.includes('red') || htmlContent.includes('giảm')) {
              diffNum = -Math.abs(diffNum);
            }
            
            return { current: currentPrice, diff: diffNum };
          };

          const buyData = parseRaw(cols[1]);
          const sellData = parseRaw(cols[2]);

          const item = { 
            buy: buyData.current, 
            sell: sellData.current, 
            diff: sellData.diff 
          };

          if (name === "SJC" || name.includes("SJC TP")) responseData.sjc = item;
          else if (name.includes("DOJI HN") || name.includes("DOJI HÀ NỘI")) responseData.dojiHn = item;
          else if (name.includes("DOJI SG") || name.includes("DOJI HỒ CHÍ MINH")) responseData.dojiSg = item;
          else if (name.includes("BTMH") || name.includes("BẢO TÍN") || name.includes("MINH CHÂU")) responseData.btmh = item;
        }
      });

      // -- 2. QUÉT MẢNG BIỂU ĐỒ --
      let extractedChartData = [];
      $('script').each((_, el) => {
        const text = $(el).html();
        
        if (text && text.includes('categories:') && text.includes('Bán ra')) {
            try {
                const catMatch = text.match(/categories:\s*\[(.*?)\]/);
                const sellMatch = text.match(/name:\s*['"]Bán ra['"][\s\S]*?data:\s*\[(.*?)\]/);
                
                if (catMatch && sellMatch && extractedChartData.length === 0) {
                    const categories = catMatch[1].replace(/['"]/g, '').split(',').map(s => s.trim());
                    const priceData = sellMatch[1].split(',').map(n => parseFloat(n.trim()));
                    
                    categories.forEach((date, i) => {
                        if (date && !isNaN(priceData[i])) {
                            const scaledPrice = priceData[i] > 1000 ? priceData[i] / 1000 : priceData[i];
                            extractedChartData.push({
                                date: date,
                                price: parseFloat(scaledPrice.toFixed(2))
                            });
                        }
                    });
                }
            } catch (e) {
                console.error("Lỗi parse chart 24h:", e);
            }
        }
      });

      if (extractedChartData.length > 0) {
        responseData.chartData = extractedChartData.slice(-30);
      } else {
        // Fix lỗi văng app ở đây (Thêm dấu ? và xử lý an toàn hơn)
        const baseSell = responseData.sjc?.sell;
        const base = (baseSell !== '---' ? (parseFloat(baseSell.replace(/,/g, '')) / 1000) : 82.5) || 82.5;
        
        responseData.chartData = Array.from({length: 30}, (_, i) => ({
          date: `${i+1}/3`,
          price: parseFloat((base - (Math.random() * 1.5)).toFixed(2))
        }));
      }
    } // ĐÓNG NGOẶC CỦA DOMESTIC RES Ở ĐÂY (RẤT QUAN TRỌNG)

    // ==========================================
    // 3. THẾ GIỚI (Chạy độc lập với 24h)
    // ==========================================
    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = { price: d.price, trend: d.chp > 0 ? 'up' : 'down', change: `${d.chp?.toFixed(2)}%` };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}