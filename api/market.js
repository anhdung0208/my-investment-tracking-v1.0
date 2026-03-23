import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.VITE_GOLD_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Thiếu API Key trên Vercel" });

    const worldRes = await axios.get('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': apiKey }
    });

    res.status(200).json({
      world: { 
        price: worldRes.data.price, 
        trend: worldRes.data.chp > 0 ? "up" : "down", 
        change: `${worldRes.data.chp?.toFixed(2)}%` 
      },
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}