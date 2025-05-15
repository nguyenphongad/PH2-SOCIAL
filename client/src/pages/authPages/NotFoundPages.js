import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

const NotFoundPages = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="error-code">
                    <span className="digit">4</span>
                    <div className="ghost">
                        <div className="ghost-face">
                            <div className="ghost-eyes">
                                <div className="eye"></div>
                                <div className="eye"></div>
                            </div>
                            <div className="ghost-mouth"></div>
                        </div>
                        <div className="ghost-body"></div>
                        <div className="ghost-shadow"></div>
                    </div>
                    <span className="digit">4</span>
                </div>
                
                <h1 className="error-title">Trang không tồn tại</h1>
                <p className="error-message">Liên kết bạn theo dõi có thể bị hỏng hoặc trang này có thể đã bị gỡ.</p>
                
                <div className="error-actions">
                    <button 
                        className="action-btn home-btn" 
                        onClick={() => navigate('/')}
                    >
                        <FaHome /> Về trang chủ
                    </button>
                    <button 
                        className="action-btn back-btn" 
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPages;