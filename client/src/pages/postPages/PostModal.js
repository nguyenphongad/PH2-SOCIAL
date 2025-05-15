import React, { useState, useRef, useEffect } from 'react';
import { Modal, Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { FaMapMarkerAlt, FaUserTag, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const PostModal = ({ visible, onClose, user }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [postText, setPostText] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [processedImages, setProcessedImages] = useState({});
    
    // Reset state khi đóng modal
    useEffect(() => {
        if (!visible) {
            const timeout = setTimeout(() => {
                setCurrentSlide(0);
                setProcessedImages({});
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [visible]);
    
    // Kiểm tra trước khi upload
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Bạn chỉ có thể upload file ảnh!');
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
        }
        return isImage && isLt10M;
    };

    // Xử lý thay đổi file uploads
    const handleChange = ({ fileList: newFileList }) => {
        const updatedFileList = [...newFileList];
        setFileList(updatedFileList);
    };

    // Xử lý xem trước & tối ưu bộ nhớ
    const getImageUrl = (file) => {
        if (!file.originFileObj) return file.url;
        
        if (processedImages[file.uid]) {
            return processedImages[file.uid];
        }
        
        const objectUrl = URL.createObjectURL(file.originFileObj);
        
        setProcessedImages(prev => ({
            ...prev,
            [file.uid]: objectUrl
        }));
        
        return objectUrl;
    };

    // Preview ảnh riêng lẻ
    const handlePreview = async (file) => {
        const url = getImageUrl(file);
        setPreviewImage(url);
        setPreviewVisible(true);
    };

    // Xóa ảnh
    const handleRemoveImage = (index) => {
        const newFileList = [...fileList];
        
        const removedFile = newFileList[index];
        if (removedFile && removedFile.uid && processedImages[removedFile.uid]) {
            URL.revokeObjectURL(processedImages[removedFile.uid]);
            setProcessedImages(prev => {
                const updated = {...prev};
                delete updated[removedFile.uid];
                return updated;
            });
        }
        
        newFileList.splice(index, 1);
        setFileList(newFileList);
        
        // Reset slide index
        if (currentSlide >= newFileList.length) {
            setCurrentSlide(Math.max(0, newFileList.length - 1));
        }
    };

    // Giải phóng bộ nhớ khi component unmount
    useEffect(() => {
        return () => {
            Object.values(processedImages).forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);

    // Xử lý đăng bài
    const handlePost = async () => {
        if (fileList.length === 0 && !postText.trim()) {
            message.warning('Vui lòng thêm ảnh hoặc nội dung cho bài viết!');
            return;
        }

        setUploading(true);
        
        try {
            // TODO: API call để đăng bài
            // const formData = new FormData();
            // fileList.forEach(file => {
            //     formData.append('files', file.originFileObj);
            // });
            // formData.append('content', postText);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            message.success('Đăng bài viết thành công!');
            setFileList([]);
            setPostText('');
            onClose();
        } catch (error) {
            message.error('Đăng bài thất bại. Vui lòng thử lại!');
        } finally {
            setUploading(false);
        }
    };

    // Xử lý chuyển slide
    const nextSlide = () => {
        if (currentSlide < fileList.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    // Chọn thumbnail
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const uploadButton = (
        <div>
            {uploading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Thêm ảnh</div>
        </div>
    );

    return (
        <>
            <Modal
                open={visible}
                title="Tạo bài viết mới"
                onCancel={onClose}
                footer={null}
                width="80%"
                style={{ top: 50, maxWidth: '100vw', margin: "0px auto", padding: 0 }}
                bodyStyle={{ height: '600px' }}
                className="post-creation-modal"
                destroyOnClose
            >
                <div className="post-modal-content">
                    <div className="post-modal-media-section">
                        {fileList.length > 0 ? (
                            <div className="custom-image-slider">
                                <div className="slider-container">
                                    {fileList.map((file, index) => (
                                        <div 
                                            key={file.uid || index} 
                                            className={`slider-item ${index === currentSlide ? 'active' : ''}`}
                                        >
                                            {index === currentSlide && (
                                                <div className="slider-image-wrapper">
                                                    <img
                                                        src={getImageUrl(file)}
                                                        alt="Post"
                                                        className="slider-image"
                                                        loading="lazy"
                                                    />
                                                    <button 
                                                        className="image-remove-btn" 
                                                        onClick={() => handleRemoveImage(index)}
                                                        title="Xóa ảnh này"
                                                    >
                                                        <CloseOutlined />
                                                    </button>
                                                    
                                                    
                                                    {fileList.length > 1 && (
                                                        <div className="image-counter">
                                                            {index + 1}/{fileList.length}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {fileList.length > 1 && (
                                    <>
                                        <button 
                                            className={`slider-nav prev ${currentSlide === 0 ? 'disabled' : ''}`}
                                            onClick={prevSlide}
                                            disabled={currentSlide === 0}
                                        >
                                            <FaArrowLeft />
                                        </button>
                                        <button 
                                            className={`slider-nav next ${currentSlide === fileList.length - 1 ? 'disabled' : ''}`}
                                            onClick={nextSlide}
                                            disabled={currentSlide === fileList.length - 1}
                                        >
                                            <FaArrowRight />
                                        </button>
                                    </>
                                )}
                                
                                {fileList.length > 1 && (
                                    <div className="image-thumbnails">
                                        {fileList.map((file, index) => (
                                            <div 
                                                key={file.uid || index} 
                                                className={`thumbnail-item ${index === currentSlide ? 'active' : ''}`}
                                                onClick={() => goToSlide(index)}
                                            >
                                                <img
                                                    src={getImageUrl(file)}
                                                    alt={`Thumbnail ${index}`}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    beforeUpload={beforeUpload}
                                    multiple
                                    accept="image/*"
                                >
                                    {fileList.length >= 10 ? null : uploadButton}
                                </Upload>
                                <p>Kéo ảnh vào đây hoặc nhấn để chọn file</p>
                            </div>
                        )}
                    </div>

                    <div className="post-modal-form-section">
                        <div className="user-info">
                            <img src={user.profilePicture} alt={user.name} className="user-avatar" />
                            <div>
                                <strong>{user.name}</strong>
                                <span>@{user.username}</span>
                            </div>
                        </div>

                        <div className="post-textarea-container">
                            <textarea
                                placeholder="Viết gì đó về bài đăng của bạn..."
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                rows={6}
                            />
                        </div>

                        <div className="post-actions">
                            <button
                                className="cancel-btn"
                                onClick={onClose}
                                disabled={uploading}
                            >
                                Huỷ
                            </button>
                            <button
                                className="post-btn"
                                onClick={handlePost}
                                disabled={uploading || (fileList.length === 0 && !postText.trim())}
                            >
                                {uploading ? 'Đang đăng...' : 'Chia sẻ'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default PostModal;
