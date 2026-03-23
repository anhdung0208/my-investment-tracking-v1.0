import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=600');

  const apiKey = process.env.GOLD_API_KEY;
  const url = "https://giavang.net/";

  try {
    const [worldRes, domesticRes] = await Promise.allSettled([
      axios.get('https://www.goldapi.io/api/XAU/USD', {
        headers: { 'x-access-token': apiKey },
        timeout: 7000
      }),
      axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 7000
      })
    ]);

    let responseData = {
      world: { price: 2175, trend: 'down', change: '0%' },
      sjc: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      pnj: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      doji: { buy: '---', sell: '---', oldBuy: '---', oldSell: '---' },
      chartData: [],
      updatedAt: new Date().toLocaleString('vi-VN')
    };

    // Scrape
    if (domesticRes.status === 'fulfilled') {
      const $ = cheerio.load(domesticRes.value.data);

      $('table tbody tr').each((_, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 5) {
          const name = $(cols[0]).text().trim().toUpperCase();

          const clean = (val) => val.split('\n')[0].trim();

          const item = {
            buy: clean($(cols[1]).text()),
            sell: clean($(cols[2]).text()),
            oldBuy: clean($(cols[3]).text()),
            oldSell: clean($(cols[4]).text())
          };

          if (name.includes("SJC")) responseData.sjc = item;
          if (name.includes("PNJ")) responseData.pnj = item;
          if (name.includes("DOJI")) responseData.doji = item;
        }
      });
    }

    // Gold API
    if (worldRes.status === 'fulfilled') {
      const d = worldRes.value.data;
      responseData.world = {
        price: d?.price,
        trend: d?.chp > 0 ? 'up' : 'down',
        change: `${d?.chp?.toFixed(2) || 0}%`
      };
    }

    return res.status(200).json(responseData);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Fetch failed",
      updatedAt: new Date().toLocaleTimeString()
    });
  }
}