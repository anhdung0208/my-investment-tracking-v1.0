export const fetchGoldPrices = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
};