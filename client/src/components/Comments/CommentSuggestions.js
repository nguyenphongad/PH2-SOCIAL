import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../styles/ChatPageStyle/CommentSuggestions.scss";
import { LoadingOutlined } from '@ant-design/icons';
import { FaTimes } from 'react-icons/fa';
import { BASE_URLS } from '../../config';

const CommentSuggestions = ({ postContent, onSelectSuggestion, isVisible, onHide }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    // Gợi ý mặc định sẽ hiển thị ngay lập tức
    "Thật tuyệt vời! Cảm ơn bạn đã chia sẻ",
    "Rất thích nội dung này!",
    "Bài viết hay quá",
    "Cảm ơn vì đã chia sẻ thông tin hữu ích",
    "Chúc mừng bạn nhé!"
  ]);
  const [error, setError] = useState(null);
  const [hasLoadedSuggestions, setHasLoadedSuggestions] = useState(false);

  useEffect(() => {
    // Chỉ tải gợi ý khi component được hiển thị và chưa tải trước đó
    if (isVisible && postContent && !hasLoadedSuggestions) {
      loadSuggestions();
    }
  }, [isVisible, postContent, hasLoadedSuggestions]);

  const loadSuggestions = async () => {
    if (!postContent) {
      return; // Không tải nếu không có nội dung
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log("Sending request for suggestions with content:", postContent.substring(0, 50) + "...");
      const response = await axios.post(
        `${BASE_URLS.CHAT_SERVICE}/suggestion/comments`,
        { message: postContent },
        { timeout: 10000 }
      );

      console.log("Response from suggestion API:", response.data);

      if (response.data && (response.data.suggestions || response.data.response)) {
        // Hỗ trợ cả hai cấu trúc phản hồi
        const newSuggestions = response.data.suggestions || response.data.response;
        if (Array.isArray(newSuggestions) && newSuggestions.length > 0) {
          setSuggestions(newSuggestions);
          setHasLoadedSuggestions(true);
        }
      }
    } catch (err) {
      console.error('Error fetching comment suggestions:', err);
      // Không đặt lỗi vào state để giữ các gợi ý mặc định
    } finally {
      setLoading(false);
    }
  };

  // Không render gì nếu không hiển thị
  if (!isVisible) return null;

  return (
    <div className="comment-suggestions">
      <div className="comment-suggestions-header">
        <span>Gợi ý bình luận</span>
        <button className="suggestion-close-btn" onClick={onHide}>
          <FaTimes />
        </button>
      </div>
      <div className="comment-suggestions-content">
        {loading ? (
          <div className="loading-container">
            <LoadingOutlined spin />
            <span>Đang tạo thêm gợi ý bình luận...</span>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="suggestion-item"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        ) : (
          <div className="loading-container">
            <span>Không có gợi ý cho bài viết này</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSuggestions;
