export const fetchGoldPrices = async (url) => {
  const res = await fetch(url, {
    headers: {
      "Cache-Control": "no-cache", // tránh cache trình duyệt
    },
  });

  if (!res.ok) {
    throw new Error("Fetch failed");
  }

  return res.json();
};