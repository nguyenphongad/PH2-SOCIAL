// File: client/src/pages/postPages/CreatePostPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Import trực tiếp file SCSS (không phải module)
import '../../styles/PostPageStyle/CreatePostPage.scss';

// Sử dụng biến môi trường từ file .env của client (React)
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// Hàm gọi API tạo bài đăng
async function createPostAPICall(postData, token) {
    const API_URL = '/post/create'; // API URL đã được bạn xác nhận
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể tạo bài đăng');
        }
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API tạo bài đăng:", error);
        throw error;
    }
}

// Hàm upload ảnh lên Cloudinary
async function uploadToCloudinary(file) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.error("Vui lòng cấu hình REACT_APP_CLOUDINARY_CLOUD_NAME và REACT_APP_CLOUDINARY_UPLOAD_PRESET trong file .env của client.");
        throw new Error("Lỗi cấu hình Cloudinary. Kiểm tra file .env và khởi động lại server dev.");
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Upload ảnh lên Cloudinary thất bại.');
        }
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Lỗi khi upload ảnh lên Cloudinary:", error);
        throw error;
    }
}

function CreatePostPage() {
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Kích thước ảnh không được vượt quá 5MB.');
                setSelectedFile(null);
                setImagePreview('');
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                setError('Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF, WEBP.');
                setSelectedFile(null);
                setImagePreview('');
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError(null);
            setSuccessMessage('');
        } else {
            setSelectedFile(null);
            setImagePreview('');
        }
    };

    const isValidHttpUrl = (string) => {
        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile && !videoUrl.trim()) {
            setError('Bạn cần cung cấp ít nhất hình ảnh hoặc URL video.');
            setSuccessMessage('');
            return;
        }
        if (videoUrl.trim() && !isValidHttpUrl(videoUrl)) {
            setError('URL video không hợp lệ.');
            setSuccessMessage('');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

        const token = localStorage.getItem('authToken'); // Đảm bảo key token đúng
        if (!token) {
            setError('Bạn chưa đăng nhập hoặc token không hợp lệ. Vui lòng đăng nhập lại.');
            setIsLoading(false);
            return;
        }

        let finalImageUrl = '';
        try {
            if (selectedFile) {
                finalImageUrl = await uploadToCloudinary(selectedFile);
            }

            const postData = {
                ...(content.trim() && { content: content.trim() }),
                ...(finalImageUrl && { imageUrl: finalImageUrl }),
                ...(videoUrl.trim() && { videoUrl: videoUrl.trim() })
            };
            
            if (!postData.imageUrl && !postData.videoUrl) {
                 setError('Lỗi: Không có hình ảnh hoặc video được cung cấp để đăng.');
                 setIsLoading(false);
                 return;
            }

            const result = await createPostAPICall(postData, token);
            setSuccessMessage('Đăng bài thành công!');
            console.log('Bài đăng đã được tạo:', result);
            
            setContent('');
            setSelectedFile(null);
            setImagePreview('');
            setVideoUrl('');
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi khi đăng bài.');
        } finally {
            setIsLoading(false);
        }
    };

    // Sử dụng class names dạng chuỗi
    return (
        <div className="create-post-page-container">
            <div className="create-post-form-wrapper">
                <h1 className="create-post-page-title">Tạo bài đăng mới</h1>

                {error && (
                    <div className="create-post-message-box error">
                        <strong>Lỗi</strong>
                        <p>{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="create-post-message-box success">
                        <strong>Thành công</strong>
                        <p>{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="create-post-form">
                    <div className="create-post-form-group">
                        <label htmlFor="content" className="create-post-form-label">
                            Nội dung bài viết (tùy chọn)
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="5"
                            className="create-post-form-textarea"
                            placeholder="Bạn đang nghĩ gì? Chia sẻ ngay..."
                            disabled={isLoading}
                        ></textarea>
                    </div>

                    <div className="create-post-form-group">
                        <label htmlFor="imageUpload" className="create-post-form-label">
                            Chọn hình ảnh (tối đa 5MB, JPG/PNG/GIF/WEBP)
                        </label>
                        <input
                            type="file"
                            id="imageUpload"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="create-post-form-file-input" 
                            disabled={isLoading}
                        />
                        {imagePreview && (
                            <div className="create-post-image-preview-container">
                                <p className="create-post-image-preview-text">Xem trước ảnh:</p>
                                <img src={imagePreview} alt="Xem trước ảnh" className="create-post-image-preview" />
                            </div>
                        )}
                    </div>

                    <div className="create-post-form-group">
                        <label htmlFor="videoUrl" className="create-post-form-label">
                            Hoặc URL Video (ví dụ: YouTube, Vimeo)
                        </label>
                        <input
                            type="text"
                            id="videoUrl"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="create-post-form-input" 
                            placeholder="https://example.com/video.mp4"
                            disabled={isLoading}
                        />
                         {videoUrl && !isValidHttpUrl(videoUrl) && (
                            <p className="create-post-validation-message">Vui lòng nhập URL video hợp lệ.</p>
                        )}
                    </div>

                    <div className="create-post-form-actions">
                        <button
                            type="submit"
                            disabled={isLoading || (!selectedFile && !videoUrl.trim())}
                            className="create-post-submit-button" 
                        >
                            {isLoading ? (
                                <>
                                    <svg className="create-post-loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang đăng...
                                </>
                            ) : 'Đăng bài'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePostPage;
