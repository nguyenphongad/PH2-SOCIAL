import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
// Import PostItem để sử dụng cho preview (nếu bạn đã tích hợp)
// import PostItem from '../../components/Posts/PostItem'; 
import '../../styles/PostPageStyle/CreatePostPage.scss'; // Đường dẫn SCSS bạn đã cung cấp

// Sử dụng biến môi trường
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
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [currentUserPreview, setCurrentUserPreview] = useState({
        _id: 'preview-user-id', // ID giả cho preview
        username: 'Tên người dùng',
        profilePicture: 'https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg'
    });

    useEffect(() => {
        const token = localStorage.getItem('USER_TOKEN'); // Sử dụng key token bạn đã xác nhận
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setCurrentUserPreview({
                    _id: decodedToken.userID, 
                    username: decodedToken.username || 'Người dùng',
                    profilePicture: decodedToken.profilePicture || 'https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg'
                });
            } catch (err) {
                console.error("Lỗi giải mã token:", err);
                setError("Lỗi xác thực người dùng. Vui lòng đăng nhập lại.");
            }
        } else {
             setError("Bạn cần đăng nhập để tạo bài đăng.");
        }
    }, []);

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Kích thước ảnh không được vượt quá 5MB.');
                setSelectedFile(null);
                setImagePreviewUrl('');
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                setError('Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF, WEBP.');
                setSelectedFile(null);
                setImagePreviewUrl('');
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setSelectedFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
            setError(null);
            setSuccessMessage('');
        } else {
            setSelectedFile(null);
            setImagePreviewUrl('');
        }
    };

    const isValidHttpUrl = (string) => {
        let url;
        try { url = new URL(string); } catch (_) { return false; }
        return url.protocol === "http:" || url.protocol === "https:";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Backend yêu cầu ít nhất phải có ảnh HOẶC video.
        // Frontend chỉ cần đảm bảo gửi những gì người dùng đã nhập/chọn.
        // Nếu cả content, ảnh, và video đều trống, thì không cho submit.
        if (!content.trim() && !selectedFile && !videoUrl.trim()) {
            setError('Bạn cần nhập nội dung, hoặc chọn ảnh, hoặc cung cấp URL video.');
            setSuccessMessage('');
            return;
        }
        // Kiểm tra URL video nếu có nhập
        if (videoUrl.trim() && !isValidHttpUrl(videoUrl)) {
            setError('URL video không hợp lệ.');
            setSuccessMessage('');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage('');
        const token = localStorage.getItem('USER_TOKEN');
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
                ...(videoUrl.trim() && isValidHttpUrl(videoUrl) && { videoUrl: videoUrl.trim() })
            };
            
            // Validation ở backend sẽ kiểm tra xem có ít nhất imageUrl hoặc videoUrl không.
            // Nếu người dùng chỉ nhập content, và backend yêu cầu media, thì backend sẽ báo lỗi.
            if (!postData.imageUrl && !postData.videoUrl && content.trim()) {
                 // Nếu bạn muốn BẮT BUỘC phải có media nếu có content (validation này nên ở backend)
                 // setError('Bài đăng có nội dung phải kèm theo hình ảnh hoặc video.');
                 // setIsLoading(false);
                 // return;
            }


            const result = await createPostAPICall(postData, token);
            setSuccessMessage('Đăng bài thành công!');
            console.log('Bài đăng đã được tạo:', result);
            setContent('');
            setSelectedFile(null);
            setImagePreviewUrl('');
            setVideoUrl('');
            if (fileInputRef.current) fileInputRef.current.value = "";
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi khi đăng bài.');
        } finally {
            setIsLoading(false);
        }
    };

    const showPostPreview = content.trim() || imagePreviewUrl || (videoUrl.trim() && isValidHttpUrl(videoUrl));

    return (
        <div className="create-post-page-container"> {/* Container chính của trang */}
            <div className="create-post-main-layout"> {/* Wrapper cho layout 2 cột */}
                {/* --- Cột Form tạo bài đăng (Bên trái) --- */}
                <div className="create-post-form-column">
                    <div className="create-post-form-wrapper"> {/* Giữ lại wrapper này để có padding và shadow */}
                        <h1 className="create-post-page-title">Tạo bài đăng mới</h1>
                        {error && (
                            <div className="create-post-message-box error">
                                <strong>Lỗi</strong> <p>{error}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="create-post-message-box success">
                                <strong>Thành công</strong> <p>{successMessage}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="create-post-form">
                            <div className="create-post-form-group">
                                <label htmlFor="content" className="create-post-form-label">
                                    Nội dung bài viết (tùy chọn)
                                </label>
                                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="5" className="create-post-form-textarea" placeholder="Bạn đang nghĩ gì? Chia sẻ ngay..." disabled={isLoading}></textarea>
                            </div>
                            <div className="create-post-form-group">
                                <label htmlFor="imageUpload" className="create-post-form-label">
                                    Chọn hình ảnh (tối đa 5MB)
                                </label>
                                <div className="file-input-wrapper"> {/* Wrapper cho input và tên file */}
                                    <input type="file" id="imageUpload" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/gif,image/webp" className="create-post-form-file-input" disabled={isLoading} />
                                    {selectedFile && ( // Hiển thị tên file đã chọn
                                        <span className="selected-file-name">{selectedFile.name}</span>
                                    )}
                                </div>
                            </div>
                            <div className="create-post-form-group">
                                <label htmlFor="videoUrl" className="create-post-form-label">
                                    Hoặc URL Video
                                </label>
                                <input type="text" id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="create-post-form-input" placeholder="https://example.com/video.mp4" disabled={isLoading}/>
                                {videoUrl && !isValidHttpUrl(videoUrl) && (
                                    <p className="create-post-validation-message">Vui lòng nhập URL video hợp lệ.</p>
                                )}
                            </div>
                            <div className="create-post-form-actions">
                                <button type="submit" disabled={isLoading || (!selectedFile && !videoUrl.trim())} className="create-post-submit-button">
                                    {isLoading ? (
                                        <><svg className="create-post-loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Đang đăng...</>
                                    ) : 'Đăng bài'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- Cột Xem Trước Bài Đăng (Bên phải) --- */}
                <div className="create-post-preview-column">
                     <h2 className="create-post-preview-title">Xem trước bài đăng</h2>
                    {showPostPreview ? (
                        <div className="post-item-card preview-mode"> {/* Sử dụng class của PostItem */}
                            <div className="post-item-header">
                                <div className="user-info">
                                    <img
                                        src={currentUserPreview.profilePicture}
                                        alt="Avatar của bạn"
                                        className="user-avatar"
                                        onError={(e) => { e.target.onerror = null; e.target.src='https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg'}}
                                    />
                                    <span className="username">{currentUserPreview.username}</span>
                                </div>
                                <span className="timestamp">• Bây giờ</span>
                            </div>

                            {(imagePreviewUrl || (videoUrl.trim() && isValidHttpUrl(videoUrl))) && (
                                <div className="post-item-media">
                                    {imagePreviewUrl ? (
                                        <img src={imagePreviewUrl} alt="Nội dung xem trước" className="post-image" />
                                    ) : (
                                        <div className="post-video-placeholder">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="video-icon-preview">
                                                <path d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" />
                                            </svg>
                                            <span>Video: {videoUrl}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="post-item-actions preview-actions">
                                <button className="action-button like-button" disabled>
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /> </svg>
                                </button>
                                <button className="action-button comment-button" disabled>
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /> </svg>
                                </button>
                                <button className="action-button share-button" disabled>
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /> </svg>
                                </button>
                            </div>
                            {(content.trim().length % 5 > 0 || imagePreviewUrl || videoUrl.trim()) && (
                                <div className="post-item-likes">
                                    <strong>{(content.trim().length % 5)} lượt thích</strong>
                                </div>
                            )}
                            {content.trim() && (
                                <div className="post-item-content">
                                    <span className="username-caption">{currentUserPreview.username}</span>
                                    <span className="caption">{content}</span>
                                </div>
                            )}
                             {(content.trim().length % 7 > 0 || imagePreviewUrl || videoUrl.trim()) && (
                                 <div className="post-item-view-comments">
                                    <a>Xem tất cả {(content.trim().length % 7)} bình luận</a>
                                 </div>
                            )}
                        </div>
                    ) : (
                        <div className="create-post-preview-placeholder">
                            Nhập nội dung hoặc thêm media để xem trước...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreatePostPage;
