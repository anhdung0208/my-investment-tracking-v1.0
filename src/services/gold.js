export const fetchGoldPrices = async () => {
  try {
    const response = await fetch('/api/market');
    
    // Nếu chạy ở Local (không có Vercel Function) hoặc API lỗi
    if (!response.ok) throw new Error("API not available");

    return await response.json();
  } catch (error) {
    console.warn("Đang dùng dữ liệu dự phòng (Chế độ Offline/Local)");
    return {
      world: { price: 2170.5, unit: "USD/oz", trend: "up", change: "Live" },
      sjc: { buy: 80.5, sell: 82.5, unit: "tr/lượng" },
      usd: { rate: 25400, unit: "VND" },
      updatedAt: "Dữ liệu Offline"
    };
  }
};