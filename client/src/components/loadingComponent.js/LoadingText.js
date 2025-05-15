import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const LoadingText = ({ text = "Đang tải..." }) => {
    const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;
    
    return (
        <div className="loading_text">
            <div className="loading-container-centered">
                <Spin indicator={antIcon} />
                <p className="loading-text">{text}</p>
            </div>
        </div>
    );
};

export default LoadingText;