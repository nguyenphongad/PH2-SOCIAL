import React, { useState, useRef, useEffect } from 'react';
import { Modal, Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { FaMapMarkerAlt, FaUserTag, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, updatePost } from '../../redux/thunks/postThunk';

// Lấy biến môi trường từ .env
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;


// Hàm upload ảnh lên Cloudinary
async function uploadSingleImageToCloudinary(file) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.error("Cloudinary .env not configured.");
        throw new Error("Lỗi cấu hình Cloudinary.");
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST', body: formData
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `Upload ảnh "${file.name}" thất bại.`);
        }
        const data = await response.json();
        return data.secure_url;
    } catch (error) { 
        console.error(`Lỗi upload ảnh "${file.name}" lên Cloudinary:`, error); 
        throw error; 
    }
}

// Sửa lại component để hỗ trợ cả tạo mới và chỉnh sửa
const PostModal = ({ visible, onClose, user, isEditing = false, existingPost = null }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [postText, setPostText] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [processedImages, setProcessedImages] = useState({});
    const dispatch = useDispatch();
    
    // Sử dụng tên slice đúng và có fallback là đối tượng rỗng
    const postState = useSelector(state => state.post || {}); 
    const createStatus = postState.createStatus || 'idle';
    const updateStatus = postState.updateStatus || 'idle';
    
    // Khởi tạo dữ liệu khi đang ở chế độ chỉnh sửa
    useEffect(() => {
        if (visible && isEditing && existingPost) {
            // Đặt nội dung bài viết
            setPostText(existingPost.content || '');
            
            // Xử lý ảnh có sẵn
            if (existingPost.imageUrls && existingPost.imageUrls.length > 0) {
                const existingImages = existingPost.imageUrls.map((url, index) => ({
                    uid: `existing-${index}`,
                    name: `image-${index}.jpg`,
                    status: 'done',
                    url: url,
                    isExisting: true // Đánh dấu đây là ảnh đã có sẵn
                }));
                
                setFileList(existingImages);
            } else {
                setFileList([]);
            }
        } else if (visible && !isEditing) {
            // Reset dữ liệu khi mở modal ở chế độ tạo mới
            setPostText('');
            setFileList([]);
        }
    }, [visible, isEditing, existingPost]);
    
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

    // Xử lý gửi form - đăng bài mới hoặc cập nhật
    const handleSubmit = async () => {
        if (fileList.length === 0 && !postText.trim()) {
            message.warning('Vui lòng thêm ảnh hoặc nội dung cho bài viết!');
            return;
        }

        setUploading(true);
        
        try {
            let imageUrls = [];
            
            // Phân loại ảnh: ảnh có sẵn và ảnh mới cần upload
            const existingImages = fileList.filter(file => file.isExisting).map(file => file.url);
            const newImages = fileList.filter(file => !file.isExisting);
            
            // Upload ảnh mới lên Cloudinary nếu có
            if (newImages.length > 0) {
                const uploadPromises = newImages.map(file => {
                    return uploadSingleImageToCloudinary(file.originFileObj);
                });
                
                const newImageUrls = await Promise.all(uploadPromises);
                imageUrls = [...existingImages, ...newImageUrls];
            } else {
                imageUrls = existingImages;
            }
            
            // Tạo dữ liệu bài đăng
            const postData = {
                content: postText.trim(),
                imageUrls: imageUrls
            };
            
            if (isEditing && existingPost) {
                // Cập nhật bài đăng hiện có
                const result = await dispatch(updatePost({
                    postId: existingPost._id,
                    updatedData: postData
                })).unwrap();
                
                if (result) {
                    message.success('Cập nhật bài viết thành công!');
                    onClose();
                }
            } else {
                // Tạo bài đăng mới
                const result = await dispatch(createPost(postData)).unwrap();
                
                if (result) {
                    message.success('Đăng bài viết thành công!');
                    setFileList([]);
                    setPostText('');
                    onClose();
                }
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            message.error(error.message || 'Thao tác thất bại. Vui lòng thử lại!');
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

    // Xác định trạng thái loading từ Redux
    const isLoading = isEditing ? updateStatus === 'loading' : createStatus === 'loading';
    // Kết hợp trạng thái loading từ component local và từ Redux
    const isSubmitting = uploading || isLoading;

    // Xác định tiêu đề và text button theo mode
    const modalTitle = isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới";
    const submitButtonText = isEditing ? "Cập nhật" : "Chia sẻ";

    return (
        <>
            <Modal
                open={visible}
                title={modalTitle}
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
                                    disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="post-actions">
                            <button
                                className="cancel-btn"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Huỷ
                            </button>
                            <button
                                className="post-btn"
                                onClick={handleSubmit}
                                disabled={isSubmitting || (fileList.length === 0 && !postText.trim())}
                            >
                                {isSubmitting ? (isEditing ? 'Đang cập nhật...' : 'Đang đăng...') : submitButtonText}
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
