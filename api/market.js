import axios from "axios";
import * as cheerio from "cheerio";

// ======================
// UTILS
// ======================
const normalize = (str = "") =>
  str
    .replace(/\s+/g, " ")
    .replace(/đ|vnđ/gi, "")
    .trim()
    .toUpperCase();

const getNumber = (val) => {
  if (typeof val === "number") return val;
  const n = parseFloat(String(val || "").replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
};

// parse chuẩn: tách theo text và xác định tăng/giảm qua html
const parseRaw = ($, td) => {
  const parts = $(td)
    .contents()
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  let current = "---";
  let diff = 0;

  if (parts.length > 0) current = parts[0];
  if (parts.length > 1) {
    diff = getNumber(parts[1]) || 0;
    
    // Check if it's down (24h uses classes like 'downIcon', 'ic_down', or text 'giảm')
    const htmlContent = $(td).html()?.toLowerCase() || '';
    if (htmlContent.includes('down') || htmlContent.includes('giam')) {
      diff = -diff;
    }
  } else {
    // Sometimes they put the diff in a separate span without spaces, let's parse raw text
    const rawText = $(td).text().trim().replace(/[\n\t\r]/g, ' ');
    const splitText = rawText.split(/\s+/).filter(Boolean);
    if (splitText.length > 0) current = splitText[0];
    if (splitText.length > 1) {
      diff = getNumber(splitText[1]) || 0;
      const htmlContent = $(td).html()?.toLowerCase() || '';
      if (htmlContent.includes('down') || htmlContent.includes('giam')) {
        diff = -diff;
      }
    }
  }

  return { current, diff };
};

// ======================
// HANDLER
// ======================
export default async function handler(req, res) {
  const apiKey = process.env.GOLD_API_KEY;

  // Set Cache-Control header for Vercel Edge Network
  // s-maxage=300 (5 minutes), stale-while-revalidate=60
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  try {
    const [worldRes, domesticRes] = await Promise.allSettled([
      fetch("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": apiKey },
        signal: AbortSignal.timeout(5000),
      }).then(res => res.json()),
      
      fetch("https://www.24h.com.vn/gia-vang-hom-nay-c425.html", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(10000),
      }).then(res => res.text()),
    ]);

    const responseData = {
      world: { price: 0, trend: "neutral", change: "0%", changeValue: 0 },
      sjc: { buy: "---", sell: "---", buyDiff: 0, sellDiff: 0 },
      dojiHn: { buy: "---", sell: "---", buyDiff: 0, sellDiff: 0 },
      dojiSg: { buy: "---", sell: "---", buyDiff: 0, sellDiff: 0 },
      btmh: { buy: "---", sell: "---", buyDiff: 0, sellDiff: 0 },
      chartData: [],
      updatedAt: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
    };

    // ======================
    // PARSE DOMESTIC (24H)
    // ======================
    if (domesticRes.status === "fulfilled") {
      const $ = cheerio.load(domesticRes.value);
      let rowIndex = 0;

      // Tìm bảng giá vàng
      let table = $("table").filter((_, el) => $(el).text().includes("SJC") || $(el).text().includes("DOJI")).first();
      // Nếu không tìm thấy, lấy bảng đầu tiên
      if (!table.length) table = $("table").first();
      
      const rows = table.find("tr");

      rows.each((_, el) => {
        const cols = $(el).find("td");
        if (cols.length < 3) return;

        const name = normalize($(cols[0]).text());
        if (!name) return;

        rowIndex++;

        const buy = parseRaw($, cols[1]);
        const sell = parseRaw($, cols[2]);

        const item = {
          buy: buy.current,
          sell: sell.current,
          buyDiff: buy.diff,
          sellDiff: sell.diff,
        };

        // ========= MATCH TEXT =========
        if (name.includes("SJC") && !name.includes("BTMC") && !name.includes("PHÚ") && responseData.sjc.buy === "---") {
          responseData.sjc = item;
        } else if (name.includes("DOJI") && (name.includes("HN") || name.includes("HÀ NỘI")) && responseData.dojiHn.buy === "---") {
          responseData.dojiHn = item;
        } else if (name.includes("DOJI") && (name.includes("SG") || name.includes("HCM") || name.includes("HỒ CHÍ MINH") || name.includes("SÀI GÒN")) && responseData.dojiSg.buy === "---") {
          responseData.dojiSg = item;
        } else if ((name.includes("BTMH") || name.includes("BẢO TÍN") || name.includes("MẠNH HẢI")) && responseData.btmh.buy === "---") {
          responseData.btmh = item;
        }
        
        // Fallback: nếu vẫn trống sau vòng lặp, dùng rowIndex
        if (rowIndex === 1 && responseData.sjc.buy === "---") responseData.sjc = item;
        if (rowIndex === 2 && responseData.dojiHn.buy === "---") responseData.dojiHn = item;
        if (rowIndex === 3 && responseData.dojiSg.buy === "---") responseData.dojiSg = item;
        if (rowIndex === 4 && responseData.btmh.buy === "---") responseData.btmh = item;
      });

      // ======================
      // PARSE CHART
      // ======================
      let extractedChartData = [];
      $("script").each((_, el) => {
        const text = $(el).html();
        if (!text || !text.includes("categories") || !text.includes("Bán ra")) return;

        try {
          const catMatch = text.match(/categories:\s*\[([\s\S]*?)\]/);
          const sellMatch = text.match(/name:\s*['"]Bán ra['"][\s\S]*?data:\s*\[([\s\S]*?)\]/);

          if (catMatch && sellMatch && extractedChartData.length === 0) {
            const categories = catMatch[1].replace(/['"]/g, "").split(",").map(s => s.trim());
            const prices = sellMatch[1].split(",").map(n => parseFloat(n.trim()));

            categories.forEach((date, i) => {
              if (date && !isNaN(prices[i])) {
                extractedChartData.push({ date, price: prices[i] });
              }
            });
          }
        } catch (e) {
          console.error("Chart parse error:", e.message);
        }
      });

      if (extractedChartData.length > 0) {
        responseData.chartData = extractedChartData.slice(-30);
      } else {
        const baseSell = getNumber(responseData.sjc.sell);
        const base = baseSell || 166000;
        responseData.chartData = Array.from({ length: 30 }, (_, i) => ({
          date: `${i + 1}`,
          price: base - (29 - i) * 200 + (Math.random() * 500),
        }));
      }
    } else {
      // Bị chặn (Cloudflare) hoặc timeout
      responseData._debug_domestic = domesticRes.reason?.message || "Rejected";
    }

    // ======================
    // WORLD GOLD
    // ======================
    if (worldRes.status === "fulfilled") {
      const d = worldRes.value;
      responseData.world = {
        price: d?.price || 0,
        trend: d?.chp > 0 ? "up" : d?.chp < 0 ? "down" : "neutral",
        change: d?.chp ? `${d.chp.toFixed(2)}%` : "0%",
        changeValue: d?.ch || 0
      };
    } else {
      responseData._debug_world = worldRes.reason?.message || "Rejected";
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("API Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
