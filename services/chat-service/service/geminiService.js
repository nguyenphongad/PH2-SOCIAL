const dotenv = require("dotenv");
dotenv.config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async (message) => {
    try {
        console.log("Sending message to Gemini:", message.substring(0, 100) + (message.length > 100 ? "..." : ""));
        
        // Nếu không có nội dung, trả về gợi ý mặc định
        if (!message || message.trim() === "") {
            return [
                "Bài viết rất hay!",
                "Cảm ơn bạn đã chia sẻ!",
                "Tôi rất thích nội dung này.",
                "Thông tin rất bổ ích.",
                "Chúc mừng bạn!"
            ];
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Cải thiện prompt để nhận được gợi ý tốt hơn
        const prompt = `
        Dựa trên nội dung bài viết sau: "${message}", 
        hãy tạo 5 gợi ý bình luận ngắn gọn, tích cực bằng tiếng Việt. 
        Mỗi gợi ý không quá 10 từ. Chỉ trả về mảng các gợi ý, không cần giải thích.
        Định dạng trả về là một mảng JSON các chuỗi.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        console.log("Raw response from Gemini:", text);
        
        // Xử lý phản hồi để lấy mảng gợi ý
        try {
            // Cố gắng trích xuất một mảng từ phản hồi
            let suggestions;
            
            // Tìm kiếm một mảng JSON trong văn bản
            const jsonMatch = text.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                suggestions = JSON.parse(jsonMatch[0]);
            } else {
                // Nếu không tìm thấy mảng JSON, tách theo dòng mới
                suggestions = text.split(/\n/)
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('[') && !line.startsWith(']'))
                    .map(line => line.replace(/^["'\d\.\-\*]+\.?\s*/, '').replace(/["']$/, ''));
            }
            
            // Đảm bảo kết quả là một mảng các chuỗi
            if (Array.isArray(suggestions) && suggestions.length > 0) {
                return suggestions.slice(0, 5); // Giới hạn 5 gợi ý
            }
            
            // Fallback nếu không thể parse kết quả
            return [
                "Bài viết rất hay!",
                "Cảm ơn bạn đã chia sẻ!",
                "Nội dung thật thú vị.",
                "Thông tin rất bổ ích.",
                "Chúc mừng bạn!"
            ];
        } catch (parseError) {
            console.error("Error parsing Gemini response:", parseError);
            
            // Fallback khi không thể parse
            return [
                "Bài viết rất hay!",
                "Cảm ơn bạn đã chia sẻ!",
                "Nội dung thật thú vị.",
                "Thông tin rất bổ ích.",
                "Chúc mừng bạn!"
            ];
        }
    } catch (error) {
        console.error("Error in askGemini:", error);
        throw error;
    }
};

module.exports = { askGemini };
