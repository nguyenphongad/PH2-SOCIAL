// File: client/src/components/Posts/PostItem.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLikePostThunk } from '../../redux/thunks/postThunk';
import './PostItem.scss'; // Đường dẫn SCSS bạn đã xác nhận

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

    // --- Local State cho Optimistic UI ---
    const [isLikedLocally, setIsLikedLocally] = useState(post.isLikedByCurrentUser || false);
    const [localLikeCount, setLocalLikeCount] = useState(post.likes?.length || 0);
    const [isProcessingLike, setIsProcessingLike] = useState(false);

    // --- Đồng bộ local state khi prop 'post' từ Redux thay đổi ---
    useEffect(() => {
        // Chỉ cập nhật local state từ props nếu không đang trong quá trình xử lý like.
        // Khi isProcessingLike là true, local state (optimistic update) là nguồn chính cho UI.
        // Sau khi isProcessingLike trở lại false (API call hoàn tất),
        // local state sẽ được đồng bộ với dữ liệu mới nhất từ props.
        if (!isProcessingLike) {
            setIsLikedLocally(post.isLikedByCurrentUser || false);
            setLocalLikeCount(post.likes?.length || 0);
        }
    }, [post.isLikedByCurrentUser, post.likes, isProcessingLike]); // Thêm isProcessingLike vào dependency array

    const userInfo = post.userID && typeof post.userID === 'object'
        ? post.userID
        : { _id: null, username: post.username || 'Ẩn danh', profilePicture: 'https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg' };

    // --- Handler cho nút Like với Optimistic Update ---
    const handleLike = async () => {
        if (!currentUserId || isProcessingLike) {
            if (!currentUserId) alert("Bạn cần đăng nhập để thích bài viết!");
            return;
        }

        const previousIsLiked = isLikedLocally;
        const previousLikeCount = localLikeCount;

        // Bước 1: Optimistic Update UI
        setIsLikedLocally(!previousIsLiked);
        setLocalLikeCount(previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1);
        setIsProcessingLike(true); // Đánh dấu bắt đầu xử lý

        try {
            // Bước 2: Gọi API (Dispatch Thunk)
            await dispatch(toggleLikePostThunk(post._id)).unwrap();
            // Nếu thành công, Redux store sẽ được cập nhật.
            // `useEffect` sẽ được kích hoạt bởi sự thay đổi của `post` prop (từ Redux)
            // và `isProcessingLike` (khi nó được set lại thành false ở finally).
            // Lúc đó, local state sẽ được đồng bộ với dữ liệu "chuẩn" từ Redux.
        } catch (error) {
            // Bước 3: Rollback UI nếu API thất bại
            console.error("Lỗi khi toggle like:", error);
            setIsLikedLocally(previousIsLiked); // Hoàn tác trạng thái like
            setLocalLikeCount(previousLikeCount); // Hoàn tác số like
            alert("Đã xảy ra lỗi khi thực hiện thao tác. Vui lòng thử lại.");
        } finally {
            // Bước 4: Luôn reset trạng thái processing sau khi API call hoàn tất
            // Điều này sẽ cho phép useEffect đồng bộ lại nếu cần.
            setIsProcessingLike(false);
        }
    };

    const handleComment = () => {
        console.log('Comment on post:', post._id);
    };

    const handleShare = () => {
        console.log('Share post:', post._id);
    };

    return (
        <div className="post-item-card">
            {/* Header */}
            <div className="post-item-header">
                <Link to={userInfo._id ? `/profile/${userInfo.username}` : '#'} className="user-info">
                    <img
                        src={userInfo.profilePicture}
                        alt={`${userInfo.username}'s avatar`}
                        className="user-avatar"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg'}}
                    />
                    <span className="username">{userInfo.username}</span>
                </Link>
                <span className="timestamp">
                    {post.createdAt && `• ${formatTimeAgo(post.createdAt)}`}
                </span>
            </div>

            {/* Media */}
            {(post.imageUrl || post.videoUrl) && (
                <div className="post-item-media">
                    {post.imageUrl ? (
                        <img src={post.imageUrl} alt="Nội dung bài đăng" className="post-image" loading="lazy" />
                    ) : (
                        <div className="post-video-wrapper">
                            {post.videoUrl && post.videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video controls className="post-video">
                                    <source src={post.videoUrl} type={`video/${post.videoUrl.split('.').pop()}`} />
                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                </video>
                            ) : (
                                <div className="post-video-placeholder">
                                    <a href={post.videoUrl} target="_blank" rel="noopener noreferrer">Xem video tại đây</a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="post-item-actions">
                <button
                    onClick={handleLike}
                    className={`action-button like-button ${isLikedLocally ? 'active' : ''}`}
                    aria-label={isLikedLocally ? "Bỏ thích bài đăng" : "Thích bài đăng"}
                    disabled={isProcessingLike}
                >
                     <svg xmlns="http://www.w3.org/2000/svg"
                          fill={isLikedLocally ? 'red' : 'none'}
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke={isLikedLocally ? 'red' : 'currentColor'}
                          className="action-icon">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                     </svg>
                </button>
                <button onClick={handleComment} className="action-button comment-button" aria-label="Bình luận bài đăng">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /> </svg>
                </button>
                <button onClick={handleShare} className="action-button share-button" aria-label="Chia sẻ bài đăng">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon"> <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /> </svg>
                </button>
            </div>

            {/* Likes: Sử dụng localLikeCount để cập nhật UI ngay lập tức */}
            {localLikeCount > 0 && (
                <div className="post-item-likes">
                    <strong>{localLikeCount} lượt thích</strong>
                </div>
            )}

            {/* Content */}
            {post.content && (
                <div className="post-item-content">
                    <Link to={userInfo._id ? `/profile/${userInfo.username}` : '#'} className="username-caption">
                        {userInfo.username}
                    </Link>
                    <span className="caption">{post.content}</span>
                </div>
            )}

            {/* View Comments */}
            {post.comments && post.comments.length > 0 && (
                 <div className="post-item-view-comments">
                    <Link to={`/post/${post._id}`}>
                        Xem tất cả {post.comments.length} bình luận
                    </Link>
                 </div>
            )}
        </div>
    );
};

export default PostItem;
