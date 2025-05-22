import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
// Đảm bảo import từ commentThunk thay vì chatThunk
import { getSuggestedComments } from '../../redux/thunks/commentThunk';

const CommentSuggestions = ({ postContent, onSelectSuggestion, isVisible = true, onHide }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const dispatch = useDispatch();
    
    // Cập nhật internal state khi prop isVisible thay đổi
    useEffect(() => {
        setShowSuggestions(isVisible);
    }, [isVisible]);

    useEffect(() => {
        // Chỉ fetch khi component hiển thị và có nội dung
        if (showSuggestions && postContent) {
            fetchSuggestions();
        }
    }, [postContent, showSuggestions]);

    const fetchSuggestions = async () => {
        if (!postContent) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Sử dụng thunk getSuggestedComments và truyền trực tiếp postContent
            const result = await dispatch(getSuggestedComments(postContent)).unwrap();
            
            if (result && result.suggestions && result.suggestions.length > 0) {
                setSuggestions(result.suggestions);
            } else {
                // Fallback khi không có gợi ý hoặc kết quả không đúng định dạng
                setSuggestions([
                    "Rất hay!",
                    "Cảm ơn bạn đã chia sẻ!",
                    "Thật thú vị!",
                    "Tôi hoàn toàn đồng ý với bạn",
                    "Chia sẻ thêm nữa đi bạn"
                ]);
            }
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            setError("Không thể tải gợi ý. Vui lòng thử lại sau.");
            
            // Fallback khi có lỗi
            setSuggestions([
                "Rất hay!",
                "Cảm ơn bạn đã chia sẻ!",
                "Thật thú vị!",
                "Tôi hoàn toàn đồng ý với bạn",
                "Chia sẻ thêm nữa đi bạn"
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuggestions = () => {
        setShowSuggestions(false);
        if (onHide) onHide();
    };

    // Nếu không hiển thị, trả về null
    if (!showSuggestions) return null;

    return (
        <div className="comment-suggestions">
            <div className="comment-suggestions-header">
                <span>Gợi ý bình luận</span>
                <button className="suggestion-close-btn" onClick={handleCloseSuggestions}>
                    <FaTimes />
                </button>
            </div>
            <div className="comment-suggestions-content">
                {loading ? (
                    <div className="loading-container">Đang tải gợi ý...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default CommentSuggestions;
