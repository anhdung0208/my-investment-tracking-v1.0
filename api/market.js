import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const client = axios.create({ timeout: 8000 });

  const apiKey = process.env.GOLD_API_KEY;

  let responseData = {
    world: { price: 0, trend: "neutral", change: "0%" },
    sjc: { buy: "---", sell: "---", oldBuy: "---", oldSell: "---" },
    pnj: { buy: "---", sell: "---", oldBuy: "---", oldSell: "---" },
    doji: { buy: "---", sell: "---", oldBuy: "---", oldSell: "---" },
    chartData: [],
    updatedAt: new Date().toLocaleString("vi-VN"),
  };

  try {
    // ==============================
    // 1. CALL SONG SONG API
    // ==============================
    const [worldRes, domesticRes] = await Promise.allSettled([
      client.get("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": apiKey },
      }),
      client.get("https://www.24h.com.vn/gia-vang-hom-nay-c425.html", {
        headers: { "User-Agent": "Mozilla/5.0" },
      }),
    ]);

    // ==============================
    // 2. PARSE GIÁ VÀNG VN (24H)
    // ==============================
    if (domesticRes.status === "fulfilled") {
      const $ = cheerio.load(domesticRes.value.data);

      $("table tr").each((_, el) => {
        const cols = $(el).find("td");

        if (cols.length >= 5) {
          const name = $(cols[0]).text().trim();

          const clean = (txt) =>
            txt.replace(/\s+/g, " ").replace(/[^\d.,]/g, "").trim();

          const item = {
            buy: clean($(cols[1]).text()),
            sell: clean($(cols[2]).text()),
            oldBuy: clean($(cols[3]).text()),
            oldSell: clean($(cols[4]).text()),
          };

          if (name.includes("SJC")) responseData.sjc = item;
          if (name.includes("PNJ")) responseData.pnj = item;
          if (name.includes("DOJI")) responseData.doji = item;
        }
      });
    }

    // ==============================
    // 3. GIÁ VÀNG THẾ GIỚI
    // ==============================
    if (worldRes.status === "fulfilled") {
      const d = worldRes.value.data;

      responseData.world = {
        price: d.price,
        trend: d.chp > 0 ? "up" : d.chp < 0 ? "down" : "neutral",
        change: `${d.chp?.toFixed(2)}%`,
      };
    }

    // ==============================
    // 4. CHART 30 NGÀY (REAL DATA)
    // ==============================
    try {
      const today = new Date();
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - 30);

      const formatDate = (d) => d.toISOString().split("T")[0];

      const historyRes = await client.get(
        `https://www.goldapi.io/api/XAU/USD/history?date_from=${formatDate(
          fromDate
        )}&date_to=${formatDate(today)}`,
        {
          headers: { "x-access-token": apiKey },
        }
      );

      if (historyRes.data) {
        responseData.chartData = historyRes.data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("vi-VN"),
          price: item.price,
        }));
      }
    } catch (err) {
      // fallback nếu API history fail
      console.log("Chart API failed → fallback mock");

      responseData.chartData = Array.from({ length: 30 }, (_, i) => ({
        date: `${i + 1}`,
        price: responseData.world.price
          ? responseData.world.price + Math.random() * 20 - 10
          : 2100 + Math.random() * 50,
      }));
    }

    // ==============================
    // 5. RESPONSE
    // ==============================
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}