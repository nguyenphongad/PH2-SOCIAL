// File: client/src/pages/postPages/CreatePostPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PostItem from '../../components/Posts/PostItem'; // Để dùng cho preview cột phải
import '../../styles/PostPageStyle/CreatePostPage.scss'; // SCSS của trang này

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

async function createPostAPICall(postData, token) {
    const API_URL = '/post/create'; // API URL bạn đã xác nhận
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(postData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể tạo bài đăng');
        }
        return await response.json();
    } catch (error) { console.error("Lỗi API tạo bài đăng:", error); throw error; }
}

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
    } catch (error) { console.error(`Lỗi upload ảnh "${file.name}" lên Cloudinary:`, error); throw error; }
}

function CreatePostPage() {
    const [content, setContent] = useState('');
    // State cho nhiều ảnh
    const [selectedFiles, setSelectedFiles] = useState([]); // Mảng các đối tượng File
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]); // Mảng các URL blob cho preview nhỏ
    
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [currentUserPreview, setCurrentUserPreview] = useState({
        _id: 'preview-user-id', username: 'Tên người dùng',
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
            } catch (err) { console.error("Lỗi giải mã token:", err); setError("Lỗi xác thực người dùng."); }
        } else { setError("Bạn cần đăng nhập để tạo bài đăng."); }
    }, []);

    // Dọn dẹp URL object khi component unmount hoặc imagePreviewUrls thay đổi
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    const handleFileChange = (e) => {
        // Dọn dẹp preview cũ trước khi tạo mới
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));

        const files = Array.from(e.target.files);
        
        if (files.length === 0) {
            setSelectedFiles([]);
            setImagePreviewUrls([]);
            setError(null);
            return;
        }

        const MAX_FILES = 10;
        if (files.length > MAX_FILES) {
            setError(`Bạn chỉ có thể chọn tối đa ${MAX_FILES} ảnh.`);
            setSelectedFiles([]); 
            setImagePreviewUrls([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const newSelectedFiles = [];
        const newImagePreviewUrls = [];
        let anyFileError = false;
        let currentErrorMessages = [];

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit per file
                currentErrorMessages.push(`Ảnh "${file.name}" vượt quá 5MB.`);
                anyFileError = true;
                continue; 
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                currentErrorMessages.push(`File "${file.name}" không phải ảnh hợp lệ (chỉ JPG, PNG, GIF, WEBP).`);
                anyFileError = true;
                continue; 
            }
            newSelectedFiles.push(file);
            newImagePreviewUrls.push(URL.createObjectURL(file));
        }
        
        setError(anyFileError ? currentErrorMessages.join('\n') : null);
        setSelectedFiles(newSelectedFiles); 
        setImagePreviewUrls(newImagePreviewUrls); 
        setSuccessMessage('');
        // KHÔNG tự động xóa videoUrl khi chọn ảnh nữa
    };
    
    const handleVideoUrlChange = (e) => {
        const newVideoUrl = e.target.value;
        setVideoUrl(newVideoUrl);
        // KHÔNG tự động xóa ảnh khi nhập video URL nữa
    };


    const isValidHttpUrl = (string) => {
        if (!string) return false;
        let url;
        try { url = new URL(string); } catch (_) { return false; }
        return url.protocol === "http:" || url.protocol === "https:";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Backend yêu cầu ít nhất phải có ảnh HOẶC video (theo PostRoute.js)
        if (selectedFiles.length === 0 && !videoUrl.trim()) {
            setError('Bạn cần cung cấp ít nhất một hình ảnh hoặc URL video.');
            setSuccessMessage('');
            return;
        }
        if (videoUrl.trim() && !isValidHttpUrl(videoUrl)) {
            setError('URL video không hợp lệ.');
            setSuccessMessage('');
            return;
        }

        setIsLoading(true); setError(null); setSuccessMessage('');
        const token = localStorage.getItem('USER_TOKEN');
        if (!token) { setError('Bạn chưa đăng nhập.'); setIsLoading(false); return; }

        let uploadedImageUrls = [];
        try {
            if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(file => uploadSingleImageToCloudinary(file));
                uploadedImageUrls = await Promise.all(uploadPromises);
            }

            const postData = {
                ...(content.trim() && { content: content.trim() }),
                ...(uploadedImageUrls.length > 0 && { imageUrls: uploadedImageUrls }),
                ...(videoUrl.trim() && isValidHttpUrl(videoUrl) && { videoUrl: videoUrl.trim() })
            };
            
            // Validation ở backend sẽ kiểm tra xem có ít nhất imageUrls hoặc videoUrl không.
            // Nếu cả hai đều rỗng (dù frontend đã chặn), backend sẽ báo lỗi.
            if ((!postData.imageUrls || postData.imageUrls.length === 0) && !postData.videoUrl) {
                 setError('Lỗi: Không có hình ảnh hoặc video được cung cấp để đăng.');
                 setIsLoading(false);
                 return;
            }

            const result = await createPostAPICall(postData, token);
            setSuccessMessage('Đăng bài thành công!');
            console.log('Bài đăng đã được tạo:', result);
            setContent(''); setSelectedFiles([]); setImagePreviewUrls([]); setVideoUrl('');
            if (fileInputRef.current) fileInputRef.current.value = "";
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi khi đăng bài.');
        } finally { setIsLoading(false); }
    };

    // Dữ liệu cho PostItem preview
    const previewPostDataForPostItem = {
        _id: 'preview-post-id-' + Date.now(), 
        userID: currentUserPreview,
        content: content,
        imageUrls: imagePreviewUrls, // Truyền mảng URL blob
        videoUrl: videoUrl.trim() && isValidHttpUrl(videoUrl) ? videoUrl : '',
        likes: [], comments: [], createdAt: new Date().toISOString(), isLikedByCurrentUser: false
    };

    const showPostPreview = content.trim() || imagePreviewUrls.length > 0 || (videoUrl.trim() && isValidHttpUrl(videoUrl));

    return (
        <div className="create-post-page-container">
            <div className="create-post-main-layout">
                <div className="create-post-form-column">
                    <div className="create-post-form-wrapper">
                        <h1 className="create-post-page-title">Tạo bài đăng mới</h1>
                        {error && ( <div className="create-post-message-box error"><strong>Lỗi</strong> <p style={{whiteSpace: 'pre-line'}}>{error}</p></div> )}
                        {successMessage && ( <div className="create-post-message-box success"><strong>Thành công</strong> <p>{successMessage}</p></div> )}
                        
                        <form onSubmit={handleSubmit} className="create-post-form">
                            <div className="create-post-form-group">
                                <label htmlFor="content" className="create-post-form-label">Nội dung (tùy chọn)</label>
                                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="5" className="create-post-form-textarea" placeholder="Bạn đang nghĩ gì?" disabled={isLoading}></textarea>
                            </div>
                            <div className="create-post-form-group">
                                <label htmlFor="imageUpload" className="create-post-form-label">Chọn hình ảnh (tối đa 10 ảnh, mỗi ảnh 5MB)</label>
                                <div className="file-input-wrapper">
                                    <input
                                        type="file" id="imageUpload" ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        className="create-post-form-file-input"
                                        disabled={isLoading} // Bỏ logic disable dựa trên videoUrl
                                        multiple 
                                    />
                                    {imagePreviewUrls.length > 0 && (
                                        <div className="selected-files-preview-grid">
                                            {imagePreviewUrls.map((url, index) => (
                                                <div key={index} className="selected-file-thumbnail-item">
                                                    <img src={url} alt={`Preview ${index + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="create-post-form-group">
                                <label htmlFor="videoUrl" className="create-post-form-label">Hoặc URL Video</label>
                                <input 
                                    type="text" id="videoUrl" value={videoUrl} 
                                    onChange={handleVideoUrlChange} 
                                    className="create-post-form-input" 
                                    placeholder="https://example.com/video.mp4" 
                                    disabled={isLoading} // Bỏ logic disable dựa trên selectedFiles
                                />
                                {videoUrl && !isValidHttpUrl(videoUrl) && ( <p className="create-post-validation-message">URL video không hợp lệ.</p> )}
                            </div>
                            <div className="create-post-form-actions">
                                <button 
                                    type="submit" 
                                    // Điều kiện submit: ít nhất phải có ảnh HOẶC video
                                    disabled={isLoading || (selectedFiles.length === 0 && !videoUrl.trim())} 
                                    className="create-post-submit-button">
                                    {isLoading ? 'Đang đăng...' : 'Đăng bài'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="create-post-preview-column">
                     <h2 className="create-post-preview-title">Xem trước bài đăng</h2>
                    {showPostPreview ? (
                        <PostItem post={previewPostDataForPostItem} />
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
