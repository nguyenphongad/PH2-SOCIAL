// File: client/src/components/Posts/PostItem.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLikePostThunk } from '../../redux/thunks/postThunk';
import './PostItem.scss'; // Đảm bảo import SCSS

// --- Hàm Helper định dạng thời gian đơn giản ---
const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return past.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// --- Component PostItem ---
const PostItem = ({ post }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const currentUserId = currentUser?._id;

    const [isLikedForDisplay, setIsLikedForDisplay] = useState(post.isLikedByCurrentUser || false);
    const [likeCountForDisplay, setLikeCountForDisplay] = useState(post.likes?.length || 0);
    const [isProcessingLike, setIsProcessingLike] = useState(false);

    // --- State cho Lightbox ---
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentLightboxImageIndex, setCurrentLightboxImageIndex] = useState(0);

    useEffect(() => {
        setIsLikedForDisplay(post.isLikedByCurrentUser || false);
        setLikeCountForDisplay(post.likes?.length || 0);
    }, [post.isLikedByCurrentUser, post.likes, post._id]);

    const userInfo = post.userID && typeof post.userID === 'object'
        ? post.userID
        : { _id: null, username: post.username || 'Ẩn danh', profilePicture: 'https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg' };

    const handleLike = async () => {
        if (!currentUserId || isProcessingLike) {
            if (!currentUserId) alert("Bạn cần đăng nhập để thích bài viết!");
            return;
        }
        const originalIsLiked = post.isLikedByCurrentUser || false;
        const originalLikeCount = post.likes?.length || 0;
        const newOptimisticIsLiked = !originalIsLiked;
        const newOptimisticLikeCount = originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1;
        setIsLikedForDisplay(newOptimisticIsLiked);
        setLikeCountForDisplay(newOptimisticLikeCount);
        setIsProcessingLike(true);
        try {
            await dispatch(toggleLikePostThunk(post._id)).unwrap();
        } catch (error) {
            console.error("Lỗi khi toggle like:", error);
            setIsLikedForDisplay(originalIsLiked);
            setLikeCountForDisplay(originalLikeCount);
            alert(error.message || "Đã xảy ra lỗi khi thực hiện thao tác. Vui lòng thử lại.");
        } finally {
            setIsProcessingLike(false);
        }
    };

    const handleComment = () => { console.log('Comment on post:', post._id); /* TODO */ };
    const handleShare = () => { console.log('Share post:', post._id); /* TODO */ };

    // --- Xử lý Lightbox ---
    const openLightbox = (index) => {
        if (images && images.length > 0) {
            setCurrentLightboxImageIndex(index);
            setIsLightboxOpen(true);
            document.body.style.overflow = 'hidden';
        }
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const goToPreviousImage = (e) => {
        e.stopPropagation();
        setCurrentLightboxImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNextImage = (e) => {
        e.stopPropagation();
        setCurrentLightboxImageIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    // --- Xử lý hiển thị media ---
    const images = Array.isArray(post.imageUrls) ? post.imageUrls : [];
    // SỬA LỖI: Kiểm tra kiểu dữ liệu của post.videoUrl trước khi gọi .trim()
    const video = (typeof post.videoUrl === 'string' && post.videoUrl.trim() !== '') ? post.videoUrl : null;
    const hasImages = images.length > 0;
    const hasVideo = !!video; // Chuyển thành boolean
    const hasMedia = hasImages || hasVideo;
    const numImages = images.length;

    let mediaLayoutClass = '';
    if (hasImages) {
        if (numImages === 1) mediaLayoutClass = 'single-image';
        else if (numImages === 2) mediaLayoutClass = 'two-images';
        else if (numImages === 3) mediaLayoutClass = 'three-images';
        else if (numImages === 4) mediaLayoutClass = 'four-images';
        else if (numImages >= 5) mediaLayoutClass = 'five-plus-images';
    } else if (hasVideo) {
        mediaLayoutClass = 'single-video';
    }

    return (
        <>
            <div className="post-item-card">
                {/* Header */}
                <div className="post-item-header">
                    <Link to={userInfo._id ? `/profile/${userInfo.username}` : '#'} className="user-info">
                        <img src={userInfo.profilePicture} alt={`${userInfo.username}'s avatar`} className="user-avatar" onError={(e) => { e.target.onerror = null; e.target.src='https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg'}}/>
                        <span className="username">{userInfo.username}</span>
                    </Link>
                    <span className="timestamp">{post.createdAt && `• ${formatTimeAgo(post.createdAt)}`}</span>
                </div>

                {/* Media: Hiển thị nhiều ảnh hoặc video */}
                {hasMedia && (
                    <div className={`post-item-media ${mediaLayoutClass}`}>
                        {hasImages ? (
                            images.map((imgUrl, index) => {
                                if (numImages >= 5 && index >= 4) {
                                    return null; 
                                }
                                return (
                                    <div key={imgUrl || index} className="image-container" onClick={() => openLightbox(index)}>
                                        <img src={imgUrl} alt={`Bài đăng ${index + 1}`} className="post-image" loading="lazy" />
                                        {numImages >= 5 && index === 3 && (
                                            <div className="more-images-overlay">
                                                +{numImages - 4}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : hasVideo ? ( 
                            <div className="post-video-wrapper">
                                {/* SỬA LỖI: Kiểm tra video (là post.videoUrl đã được kiểm tra) trước khi gọi .match() */}
                                {video && video.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video controls className="post-video">
                                        <source src={video} type={`video/${video.split('.').pop()}`} />
                                        Trình duyệt của bạn không hỗ trợ thẻ video.
                                    </video>
                                ) : video ? ( // Nếu video tồn tại nhưng không phải link trực tiếp
                                    <div className="post-video-placeholder">
                                        <a href={video} target="_blank" rel="noopener noreferrer">Xem video tại đây</a>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Actions, Likes, Content, Comments (giữ nguyên) */}
                <div className="post-item-actions">
                    <button onClick={handleLike} className={`action-button like-button ${isLikedForDisplay ? 'active' : ''}`} aria-label={isLikedForDisplay ? "Bỏ thích" : "Thích"} disabled={isProcessingLike}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill={isLikedForDisplay ? 'red' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isLikedForDisplay ? 'red' : 'currentColor'} className="action-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                    </button>
                    <button onClick={handleComment} className="action-button comment-button" aria-label="Bình luận"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /> </svg></button>
                    <button onClick={handleShare} className="action-button share-button" aria-label="Chia sẻ"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /> </svg></button>
                </div>
                {likeCountForDisplay > 0 && ( <div className="post-item-likes"><strong>{likeCountForDisplay} lượt thích</strong></div> )}
                {post.content && ( <div className="post-item-content"><Link to={userInfo._id ? `/profile/${userInfo.username}` : '#'} className="username-caption">{userInfo.username}</Link><span className="caption">{post.content}</span></div> )}
                {post.comments && post.comments.length > 0 && ( <div className="post-item-view-comments"><Link to={`/post/${post._id}`}>Xem tất cả {post.comments.length} bình luận</Link></div> )}
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && hasImages && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <button className="lightbox-close-button" onClick={closeLightbox} aria-label="Đóng">&times;</button>
                    {images.length > 1 && (
                        <button className="lightbox-nav-button prev" onClick={goToPreviousImage} aria-label="Ảnh trước">&#10094;</button>
                    )}
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={images[currentLightboxImageIndex]} alt={`Ảnh ${currentLightboxImageIndex + 1} của bài đăng`} className="lightbox-image" />
                    </div>
                    {images.length > 1 && (
                        <button className="lightbox-nav-button next" onClick={goToNextImage} aria-label="Ảnh kế tiếp">&#10095;</button>
                    )}
                     {images.length > 1 && (
                        <div className="lightbox-counter">{currentLightboxImageIndex + 1} / {images.length}</div>
                     )}
                </div>
            )}
        </>
    );
};

export default PostItem;
