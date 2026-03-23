import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Lấy Key từ Biến môi trường Vercel (đã cài ở bước trước)
    const apiKey = process.env.VITE_GOLD_API_KEY;

    const config = {
      method: 'get',
      url: 'https://www.goldapi.io/api/XAU/USD',
      headers: { 
        'x-access-token': apiKey, // Dùng biến môi trường cho bảo mật
        'Content-Type': 'application/json'
      }
    };

    // Gọi API bằng Axios (Tương đương với fetch ở code mẫu)
    const response = await axios(config);

    // Trả kết quả về cho Frontend React của Dũng
    return res.status(200).json({
      world: {
        price: response.data.price,
        trend: response.data.chp > 0 ? 'up' : 'down',
        change: `${response.data.chp?.toFixed(2)}%`,
        symbol: response.data.symbol
      },
      updatedAt: new Date().toLocaleTimeString('vi-VN')
    });

  } catch (error) {
    // Nếu API Key sai hoặc hết hạn, nó sẽ báo lỗi ở đây
    console.error('Lỗi GoldAPI:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: "Lỗi gọi GoldAPI", 
      message: error.response?.data?.message || error.message 
    });
  }
}