import axios from "axios";
import * as cheerio from "cheerio";

// ======================
// CACHE
// ======================
let cachedData = null;
let lastFetchTime = 0;

// ======================
// TIME LOGIC (VN)
// ======================
const getTTL = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute;

  // 🟢 GIỜ CAO ĐIỂM (giao dịch mạnh)
  if (
    // Sáng mở cửa
    (time >= 8 * 60 && time <= 11 * 60 + 30) ||

    // 🔥 10h - 12h (peak bạn yêu cầu)
    (time >= 10 * 60 && time <= 12 * 60) ||

    // Sau nghỉ trưa
    (time >= 13 * 60 + 30 && time <= 17 * 60) ||

    // Buổi tối (DOJI, PNJ)
    (time >= 19 * 60 && time <= 21 * 60)
  ) {
    return 10 * 60 * 1000; // 10 phút
  }

  // 🔴 NGOÀI GIỜ
  return 20 * 60 * 1000; // 20 phút
};

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
  const parts = $(td)
    .contents()
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  let current = "---";
  let diff = 0;

  if (parts.length > 0) current = parts[0];
  if (parts.length > 1) diff = getNumber(parts[1]) || 0;

  return { current, diff };
};

// ======================
// FETCH DATA
// ======================
const fetchData = async (apiKey) => {
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

    sjc: { buy: "---", sell: "---", buyDiff: 0, sellDiff: 0 },
    dojiHn: { buy: "---", sell: "---", buyDiff: 0, sellDiff: 0 },
    dojiSg: { buy: "---", sell: "---", buyDiff: 0, sellDiff: 0 },
    btmh: { buy: "---", sell: "---", buyDiff: 0, sellDiff: 0 },

    chartData: [],
    updatedAt: new Date().toLocaleTimeString("vi-VN"),
  };

  if (domesticRes.status === "fulfilled") {
    const $ = cheerio.load(domesticRes.value.data);

    let rowIndex = 0;

    $("table tr").each((_, el) => {
      const cols = $(el).find("td");
      if (cols.length < 3) return;

      rowIndex++;

      const name = normalize($(cols[0]).text());

      const buy = parseRaw($, cols[1]);
      const sell = parseRaw($, cols[2]);

      const item = {
        buy: buy.current,
        sell: sell.current,
        buyDiff: buy.diff,
        sellDiff: sell.diff,
      };

      if (name.includes("SJC")) responseData.sjc = item;
      else if (name.includes("DOJI") && name.includes("HN"))
        responseData.dojiHn = item;
      else if (name.includes("DOJI"))
        responseData.dojiSg = item;
      else if (name.includes("BẢO TÍN"))
        responseData.btmh = item;
      else {
        if (rowIndex === 1) responseData.sjc = item;
        if (rowIndex === 2) responseData.dojiHn = item;
        if (rowIndex === 3) responseData.dojiSg = item;
        if (rowIndex === 4) responseData.btmh = item;
      }
    });

    const baseSell = getNumber(responseData.sjc.sell);
    const base = baseSell || 166000;

    responseData.chartData = Array.from({ length: 30 }, (_, i) => ({
      date: `${i + 1}`,
      price: base - i * 500,
    }));
  }

  if (worldRes.status === "fulfilled") {
    const d = worldRes.value.data;

    responseData.world = {
      price: d?.price || 0,
      trend:
        d?.chp > 0 ? "up" : d?.chp < 0 ? "down" : "neutral",
      change: d?.chp ? `${d.chp.toFixed(2)}%` : "0%",
    };
  }

  return responseData;
};

// ======================
// HANDLER
// ======================
export default async function handler(req, res) {
  const apiKey = process.env.GOLD_API_KEY;
  const now = Date.now();
  const ttl = getTTL();

  const forceRefresh = req.query?.refresh === "true";

  // HTTP cache
  res.setHeader(
    "Cache-Control",
    `s-maxage=${ttl / 1000}, stale-while-revalidate=60`
  );

  // dùng cache
  if (!forceRefresh && cachedData && now - lastFetchTime < ttl) {
    return res.status(200).json(cachedData);
  }

  try {
    const data = await fetchData(apiKey);

    cachedData = data;
    lastFetchTime = now;

    return res.status(200).json(data);
  } catch (error) {
    console.error("API Error:", error.message);

    if (cachedData) return res.status(200).json(cachedData);

    return res.status(500).json({ error: "Internal Server Error" });
  }
}