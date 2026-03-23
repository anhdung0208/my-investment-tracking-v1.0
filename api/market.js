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
        },
        timeout: 8000,
      }),
    ]);

    const responseData = {
      world: { price: 0, trend: "neutral", change: "0%" },

      // 4 loại chính (giữ cho UI)
      sjc: null,
      dojiHn: null,
      dojiSg: null,
      btmh: null,

      // 🔥 tất cả loại vàng
      all: [],

      // 🔥 các loại khác
      others: [],

      chartData: [],
      updatedAt: new Date().toLocaleTimeString("vi-VN"),
    };

    // ======================
    // PARSE 24H
    // ======================
    if (domesticRes.status === "fulfilled") {
      const $ = cheerio.load(domesticRes.value.data);

      $("table tr").each((_, el) => {
        const cols = $(el).find("td");
        if (cols.length < 3) return;

        const rawName = $(cols[0]).text();
        const name = normalize(rawName);

        const buy = parseRaw($, cols[1]);
        const sell = parseRaw($, cols[2]);

        const item = {
          name: rawName.trim(),
          key: name,
          buy: buy.current,
          sell: sell.current,
          diff: sell.diff,
        };

        // ======================
        // PUSH ALL
        // ======================
        responseData.all.push(item);

        // ======================
        // MAP 4 LOẠI CHÍNH
        // ======================
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
            name.includes("HỒ CHÍ MINH")
          )
        ) {
          responseData.dojiSg = item;
        }

        else if (
          name.includes("BTMC") ||
          name.includes("BẢO TÍN") ||
          name.includes("MINH CHÂU") ||
          name.includes("RỒNG THĂNG LONG")
        ) {
          responseData.btmh = item;
        }
      });

      // ======================
      // OTHERS (không thuộc 4 loại)
      // ======================
      responseData.others = responseData.all.filter(
        (item) =>
          item !== responseData.sjc &&
          item !== responseData.dojiHn &&
          item !== responseData.dojiSg &&
          item !== responseData.btmh
      );

      // ======================
      // FALLBACK nếu thiếu
      // ======================
      if (!responseData.sjc && responseData.all[0])
        responseData.sjc = responseData.all[0];

      if (!responseData.dojiHn && responseData.all[1])
        responseData.dojiHn = responseData.all[1];

      if (!responseData.dojiSg && responseData.all[2])
        responseData.dojiSg = responseData.all[2];

      if (!responseData.btmh && responseData.all[3])
        responseData.btmh = responseData.all[3];

      // ======================
      // CHART
      // ======================
      let extractedChartData = [];

      $("script").each((_, el) => {
        const text = $(el).html();
        if (!text) return;

        if (text.includes("categories") && text.includes("Bán ra")) {
          const catMatch = text.match(/categories:\s*\[([\s\S]*?)\]/);
          const sellMatch = text.match(
            /name:\s*['"]Bán ra['"][\s\S]*?data:\s*\[([\s\S]*?)\]/
          );

          if (catMatch && sellMatch) {
            const categories = catMatch[1]
              .replace(/['"]/g, "")
              .split(",");

            const prices = sellMatch[1]
              .split(",")
              .map((n) => parseFloat(n.trim()));

            categories.forEach((date, i) => {
              if (!date || isNaN(prices[i])) return;

              extractedChartData.push({
                date: date.trim(),
                price: prices[i],
              });
            });
          }
        }
      });

      responseData.chartData =
        extractedChartData.length > 0
          ? extractedChartData.slice(-30)
          : [];
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