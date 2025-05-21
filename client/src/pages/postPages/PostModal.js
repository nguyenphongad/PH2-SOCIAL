import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, updatePost } from '../../redux/thunks/postThunk';
import { FaTimes } from 'react-icons/fa';
import { Upload, Button } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

// Lấy biến môi trường từ .env
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// Hàm upload ảnh lên Cloudinary
async function uploadSingleImageToCloudinary(file) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary configuration is missing');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
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
            
            // Khởi tạo fileList từ imageUrls của existingPost
            if (existingPost.imageUrls && existingPost.imageUrls.length > 0) {
                const initialFileList = existingPost.imageUrls.map((url, index) => ({
                    uid: `existing-${index}`,
                    name: `image-${index}.jpg`,
                    status: 'done',
                    url: url,
                    thumbUrl: url
                }));
                setFileList(initialFileList);
            } else {
                setFileList([]);
            }
        }
    }, [visible, isEditing, existingPost]);
    
    // Reset state khi đóng modal
    useEffect(() => {
        if (!visible) {
            if (!isEditing) {
                setPostText('');
                setFileList([]);
                setProcessedImages({});
            }
        }
    }, [visible, isEditing]);
    
    // Thêm hàm để ngăn sự kiện lan toả
    const handleModalClick = (e) => {
        e.stopPropagation();
    };
    
    // Thêm hàm để xử lý phím ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && visible) {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible, onClose]);
    
    // Kiểm tra trước khi upload
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            console.error('You can only upload image files!');
            return false;
        }
        
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            console.error('Image must be smaller than 10MB!');
            return false;
        }
        
        return true;
    };

    // Xử lý thay đổi file uploads
    const handleChange = ({ fileList: newFileList }) => {
        // Chỉ cập nhật fileList với các file đã được xử lý thành công
        setFileList(newFileList);
    };

    // Preview ảnh
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
    };

    // Xử lý gửi form - đăng bài mới hoặc cập nhật
    const handleSubmit = async () => {
        if ((!postText.trim() && fileList.length === 0) || isSubmitting) {
            return;
        }
        
        setUploading(true);
        
        try {
            // Upload các file mới (chưa có URL) lên Cloudinary
            const uploadPromises = [];
            const uploadedUrls = [];
            
            // Chỉ upload các file mới chưa có URL
            for (const file of fileList) {
                if (file.originFileObj) {
                    uploadPromises.push(
                        uploadSingleImageToCloudinary(file.originFileObj)
                            .then(url => {
                                uploadedUrls.push(url);
                                return url;
                            })
                    );
                } else if (file.url) {
                    // Giữ lại URL đã có
                    uploadedUrls.push(file.url);
                }
            }
            
            // Đợi tất cả uploads hoàn thành
            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
            }
            
            // Chuẩn bị dữ liệu cho API
            const postData = {
                content: postText.trim(),
                imageUrls: uploadedUrls,
            };
            
            if (isEditing && existingPost) {
                // Cập nhật bài viết hiện có
                await dispatch(updatePost({
                    postId: existingPost._id,
                    updatedData: postData
                })).unwrap();
                
                // Thông báo thành công
                console.log("Bài viết đã được cập nhật thành công");
            } else {
                // Tạo bài viết mới
                await dispatch(createPost(postData)).unwrap();
                
                // Thông báo thành công
                console.log("Bài viết đã được tạo thành công");
            }
            
            // Đóng modal
            onClose();
            
            // Reset form khi đăng thành công (nếu không phải chỉnh sửa)
            if (!isEditing) {
                setPostText('');
                setFileList([]);
            }
        } catch (error) {
            console.error("Error creating/updating post:", error);
        } finally {
            setUploading(false);
        }
    };

    // Hàm tiện ích để convert file thành base64
    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
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
    
    // Nếu modal không hiển thị, không render gì cả
    if (!visible) return null;

    return (
        <div className="modal-wrapper" onClick={onClose}>
            <div className="modal-container" onClick={handleModalClick}>
                <div className="modal-header">
                    <h2>{modalTitle}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                {/* Thêm thông tin người đăng bài */}
                <div className="modal-user-info">
                    <img 
                        src={user?.profilePicture || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
                        alt="User avatar" 
                        className="user-avatar" 
                    />
                    <div className="user-details">
                        <span className="username">{user?.username || "Người dùng"}</span>
                        {user?.name && <span className="name">{user.name}</span>}
                    </div>
                </div>
                
                <div className="modal-body">
                    <textarea
                        placeholder="Nhập nội dung bài viết..."
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        className="post-textarea"
                    />
                    
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                        beforeUpload={beforeUpload}
                        multiple
                    >
                        {fileList.length >= 8 ? null : uploadButton}
                    </Upload>
                </div>
                
                <div className="modal-footer">
                    <Button 
                        type="primary" 
                        loading={isSubmitting}
                        onClick={handleSubmit}
                        disabled={(!postText.trim() && fileList.length === 0) || isSubmitting}
                    >
                        {isSubmitting ? "Đang xử lý..." : submitButtonText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PostModal;