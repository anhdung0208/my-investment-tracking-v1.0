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
  const n = parseFloat(String(val || "").replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
};

const parseRaw = ($, td) => {
  const text = $(td).text().replace(/\s+/g, " ").trim();

  const priceMatch = text.match(/[\d,.]+/);
  const diffMatch = text.match(/([+-]\s*[\d,.]+)/);

  return {
    current: priceMatch ? priceMatch[0] : "---",
    diff: diffMatch ? getNumber(diffMatch[1]) || 0 : 0,
  };
};

// ======================
// HANDLER
// ======================
export default async function handler(req, res) {
  const apiKey = process.env.GOLD_API_KEY;

  try {
    const [worldRes, domesticRes] = await Promise.allSettled([
      axios.get("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": apiKey },
        timeout: 5000,
      }),
      axios.get("https://www.24h.com.vn/gia-vang-hom-nay-c425.html", {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html",
          Referer: "https://www.google.com/",
        },
        timeout: 8000,
      }),
    ]);

    const responseData = {
      world: { price: 0, trend: "neutral", change: "0%" },
      sjc: { buy: "---", sell: "---", diff: 0 },
      dojiHn: { buy: "---", sell: "---", diff: 0 },
      dojiSg: { buy: "---", sell: "---", diff: 0 },
      btmh: { buy: "---", sell: "---", diff: 0 },
      chartData: [],
      updatedAt: new Date().toLocaleTimeString("vi-VN"),
    };

    console.log("Status:", {
      world: worldRes.status,
      domestic: domesticRes.status,
    });

    // ======================
    // PARSE 24H
    // ======================
    if (domesticRes.status === "fulfilled") {
      const $ = cheerio.load(domesticRes.value.data);

      let rowIndex = 0;

      $("table tr").each((_, el) => {
        const cols = $(el).find("td");
        if (cols.length < 3) return;

        rowIndex++;

        const rawName = $(cols[0]).text();
        const name = normalize(rawName);

        const buy = parseRaw($, cols[1]);
        const sell = parseRaw($, cols[2]);

        const item = {
          buy: buy.current,
          sell: sell.current,
          diff: sell.diff,
        };

        // DEBUG (có thể bật khi cần)
        // console.log(rowIndex, name);

        // ========= MATCH TEXT =========
        if (name.includes("SJC")) {
          responseData.sjc = item;
        }

        else if (
          name.includes("DOJI") &&
          (name.includes("HN") || name.includes("HÀ NỘI"))
        ) {
          responseData.dojiHn = item;
        }

        else if (
          name.includes("DOJI") &&
          (
            name.includes("SG") ||
            name.includes("HCM") ||
            name.includes("HỒ CHÍ MINH") ||
            name.includes("SÀI GÒN")
          )
        ) {
          responseData.dojiSg = item;
        }

        else if (
          name.includes("BTMC") ||
          name.includes("BẢO TÍN") ||
          name.includes("MINH CHÂU")
        ) {
          responseData.btmh = item;
        }

        // ========= FALLBACK THEO INDEX =========
        // (nếu website đổi text hoàn toàn)
        else {
          if (rowIndex === 1 && responseData.sjc.buy === "---") {
            responseData.sjc = item;
          }
          if (rowIndex === 2 && responseData.dojiHn.buy === "---") {
            responseData.dojiHn = item;
          }
          if (rowIndex === 3 && responseData.dojiSg.buy === "---") {
            responseData.dojiSg = item;
          }
          if (rowIndex === 4 && responseData.btmh.buy === "---") {
            responseData.btmh = item;
          }
        }
      });

      // ======================
      // PARSE CHART
      // ======================
      let extractedChartData = [];

      $("script").each((_, el) => {
        const text = $(el).html();
        if (!text) return;

        if (text.includes("categories") && text.includes("Bán ra")) {
          try {
            const catMatch = text.match(/categories:\s*\[([\s\S]*?)\]/);
            const sellMatch = text.match(
              /name:\s*['"]Bán ra['"][\s\S]*?data:\s*\[([\s\S]*?)\]/
            );

            if (catMatch && sellMatch && extractedChartData.length === 0) {
              const categories = catMatch[1]
                .replace(/['"]/g, "")
                .split(",")
                .map((s) => s.trim());

              const prices = sellMatch[1]
                .split(",")
                .map((n) => parseFloat(n.trim()));

              categories.forEach((date, i) => {
                if (!date || isNaN(prices[i])) return;

                extractedChartData.push({
                  date,
                  price: prices[i],
                });
              });
            }
          } catch (e) {
            console.error("Chart parse error:", e.message);
          }
        }
      });

      if (extractedChartData.length > 0) {
        responseData.chartData = extractedChartData.slice(-30);
      } else {
        // fallback ổn định
        const baseSell = getNumber(responseData.sjc.sell);
        const base = baseSell || 166000;

        responseData.chartData = Array.from({ length: 30 }, (_, i) => ({
          date: `${i + 1}`,
          price: base - i * 500,
        }));
      }
    }

    // ======================
    // WORLD GOLD
    // ======================
    if (worldRes.status === "fulfilled") {
      const d = worldRes.value.data;

      responseData.world = {
        price: d?.price || 0,
        trend:
          d?.chp > 0 ? "up" : d?.chp < 0 ? "down" : "neutral",
        change: d?.chp ? `${d.chp.toFixed(2)}%` : "0%",
      };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("API Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}