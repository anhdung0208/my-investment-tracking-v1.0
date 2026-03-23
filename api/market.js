import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Bộ đệm (Cache) giúp API không bị treo khi nhiều người vào cùng lúc
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=30');
  const apiKey = process.env.VITE_GOLD_API_KEY;

  try {
    // 🚀 GỌI ĐÚNG 2 NGUỒN (GoldAPI cho thế giới, 24h.com.vn cho Việt Nam)
    const [worldRes, domesticRes] = await Promise.allSettled([
      axios.get('https://www.goldapi.io/api/XAU/USD', { headers: { 'x-access-token': apiKey }, timeout: 5000 }),
      axios.get('https://www.24h.com.vn/gia-vang-hom-nay-c425.html', { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000 })
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
      
      // ==========================================
      // 1. QUÉT BẢNG GIÁ 4 NHÃN HIỆU TỪ 24H
      // ==========================================
      $('table tr').each((_, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 3) {
          // Viết hoa tên để dễ so sánh (vd: sjc -> SJC)
          const name = $(cols[0]).text().trim().toUpperCase();
          
          const parseRaw = (tdElement) => {
            const text = $(tdElement).text().trim();
            // Tách các dòng ra (dòng 1: Giá, dòng 2: Biến động)
            const lines = text.split('\n').map(l => l.trim()).filter(l => l !== "");
            const currentPrice = lines[0] || '---';
            
            // Lấy con số chênh lệch (vd: 5000)
            let diffNum = 0;
            if (lines.length > 1) {
              diffNum = parseFloat((lines[lines.length - 1] || '0').replace(/[^\d.-]/g, '')) || 0;
            }
            
            // Nhìn vào class của thẻ HTML (chứa chữ down, red, giảm) để gán dấu âm (-)
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

          // Chốt đúng 4 nhãn hiệu Dũng yêu cầu
          if (name === "SJC" || name.includes("SJC TP")) responseData.sjc = item;
          else if (name.includes("DOJI HN") || name.includes("DOJI HÀ NỘI")) responseData.dojiHn = item;
          else if (name.includes("DOJI SG") || name.includes("DOJI HỒ CHÍ MINH")) responseData.dojiSg = item;
          else if (name.includes("BTMH") || name.includes("BẢO TÍN") || name.includes("MINH CHÂU")) responseData.btmh = item;
        }
      });

      // ==========================================
      // 2. QUÉT MẢNG BIỂU ĐỒ 30 NGÀY TỪ MÃ NGUỒN SCRIPT
      // ==========================================
      let extractedChartData = [];
      $('script').each((_, el) => {
        const text = $(el).html();
        
        // Chỉ quét các thẻ script có chứa biểu đồ và có chữ "Bán ra" (để né biểu đồ Thế giới)
        if (text && text.includes('categories:') && text.includes('Bán ra')) {
            try {
                // 1. Lấy mảng Ngày tháng (Trục X)
                const catMatch = text.match(/categories:\s*\[(.*?)\]/);
                // 2. Lấy CHÍNH XÁC mảng dữ liệu của đường "Bán ra" (Trục Y)
                const sellMatch = text.match(/name:\s*['"]Bán ra['"][\s\S]*?data:\s*\[(.*?)\]/);
                
                // Nếu tìm thấy và mảng chartData chưa có dữ liệu thì mới thêm vào
                if (catMatch && sellMatch && extractedChartData.length === 0) {
                    // Xóa dấu nháy đơn, nháy kép và cắt thành mảng ['08/03', '09/03']
                    const categories = catMatch[1].replace(/['"]/g, '').split(',').map(s => s.trim());
                    // Cắt mảng giá thành các số [165500, 166000]
                    const priceData = sellMatch[1].split(',').map(n => parseFloat(n.trim()));
                    
                    categories.forEach((date, i) => {
                        // Bỏ qua các ngày bị rỗng hoặc giá không phải là số
                        if (date && !isNaN(priceData[i])) {
                            // 24h lưu giá 165500, ta chia 1000 để ra 165.50 (triệu/lượng)
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

      // Lấy chính xác 30 ngày cuối cùng
      if (extractedChartData.length > 0) {
        responseData.chartData = extractedChartData.slice(-30);
      } else {
        // Dữ liệu fallback nếu 24h bảo trì script
        const base = parseFloat(responseData.sjc?.sell?.replace(/,/g, '')) / 1000 || 82.5;
        responseData.chartData = Array.from({length: 30}, (_, i) => ({
          date: `${i+1}/3`,
          price: parseFloat((base - (Math.random() * 1.5)).toFixed(2))
        }));
      }

    // ==========================================
    // 3. THẾ GIỚI
    // ==========================================
    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = { price: d.price, trend: d.chp > 0 ? 'up' : 'down', change: `${d.chp?.toFixed(2)}%` };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}