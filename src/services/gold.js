export const fetchGoldPrices = async () => {
  try {
    const response = await fetch('/api/market');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    return null;
  }
};