const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Lấy API key từ biến môi trường
const apiKey = process.env.GEMINI_API_KEY;
console.log("key ", apiKey);

// Khởi tạo model
const genAI = new GoogleGenerativeAI(apiKey);

// Cải thiện hàm askGemini với timeout 1.5 giây
async function askGemini(prompt) {
    try {
        // Tạo promise cho model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Tạo promise với timeout 1.5 giây
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("AI request timed out")), 1500);
        });
        
        // Race giữa model và timeout
        const result = await Promise.race([
            model.generateContent(prompt),
            timeoutPromise
        ]);
        
        const response = await result.response;

        console.log("response ask ", response);

        return response.text();
    } catch (error) {
        console.error("Error calling Gemini:", error);
        return "Rất hay!|Cảm ơn bạn đã chia sẻ!|Thật thú vị!|Tôi hoàn toàn đồng ý với bạn|Chia sẻ thêm nữa đi bạn";
    }
}

module.exports = { askGemini };
