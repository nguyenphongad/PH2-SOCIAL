// File: client/src/components/Posts/PostItem.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../Posts/PostItem.scss';

// --- Hàm Helper định dạng thời gian đơn giản ---
// (Có thể thay bằng date-fns để chính xác và nhiều tùy chọn hơn)
const formatTimeAgo = (timestamp) => {
    if (!timestamp) return ''; // Trả về rỗng nếu không có timestamp
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
    // Định dạng ngày/tháng/năm nếu cũ hơn
    return past.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// --- Component PostItem ---
// Giả định prop 'post' nhận được từ Redux store có cấu trúc đầy đủ sau khi populate userID:
// post: {
//   _id: '...',
//   content: '...',
//   imageUrl: '...',
//   videoUrl: '...',
//   likes: [...], // Mảng các ID hoặc object
//   comments: [...], // Mảng các ID hoặc object
//   createdAt: '...', // ISO Date String
//   userID: { // <-- Quan trọng: Đã được populate ở backend
//     _id: '...',
//     username: '...',
//     profilePicture: '...' // URL ảnh đại diện
//   },
//   // Trường username gốc vẫn có thể còn (do bạn lưu khi tạo post)
//   username: '...' 
// }
const PostItem = ({ post }) => {
    // Ưu tiên lấy thông tin từ userID đã populate, nếu không thì fallback
    const userInfo = post.userID && typeof post.userID === 'object'
        ? post.userID
        : { _id: null, username: post.username || 'Ẩn danh', profilePicture: 'https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg' };

    // --- Placeholder Handlers ---
    // Bạn sẽ cần thay thế các console.log này bằng logic thực tế (dispatch action, gọi API,...)
    const handleLike = () => {
        // TODO: Dispatch action like/unlike post
        console.log('Like post:', post._id);
        // Ví dụ: dispatch(toggleLikePostThunk(post._id));
    };

    const handleComment = () => {
        // TODO: Mở modal bình luận hoặc điều hướng
        console.log('Comment on post:', post._id);
        // Ví dụ: navigate(`/post/${post._id}`);
    };

    const handleShare = () => {
        // TODO: Xử lý logic chia sẻ
        console.log('Share post:', post._id);
        // Ví dụ: navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`); alert('Đã sao chép liên kết!');
    };

    return (
        // Sử dụng class name toàn cục, sẽ định nghĩa trong SCSS sau
        // Class chính cho card bài đăng
        <div className="post-item-card">

            {/* Phần Header: Avatar, Username, Timestamp */}
            <div className="post-item-header">
                <Link to={userInfo._id ? `/profile/${userInfo.username}` : '#'} className="user-info"> {/* Link đến profile user */}
                    <img
                        src={userInfo.profilePicture}
                        alt={`${userInfo.username}'s avatar`}
                        className="user-avatar"
                        // Fallback nếu ảnh đại diện bị lỗi
                        onError={(e) => { e.target.onerror = null; e.target.src='https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg'}}
                    />
                    <span className="username">{userInfo.username}</span>
                </Link>
                {/* Dấu chấm và thời gian đăng */}
                <span className="timestamp">
                    {post.createdAt && `• ${formatTimeAgo(post.createdAt)}`}
                    {/* Ví dụ dùng date-fns: */}
                    {/* {post.createdAt && `• ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}`} */}
                </span>
                {/* Nút tùy chọn (ví dụ: chỉnh sửa, xóa) - có thể thêm sau */}
                {/* <button className="options-button">...</button> */}
            </div>

            {/* Phần Media: Hiển thị ảnh hoặc video */}
            {(post.imageUrl || post.videoUrl) && (
                <div className="post-item-media">
                    {post.imageUrl ? (
                        // Hiển thị ảnh
                        <img src={post.imageUrl} alt="Nội dung bài đăng" className="post-image" loading="lazy" />
                    ) : (
                        // Hiển thị video (dùng thẻ video nếu là link trực tiếp, hoặc placeholder)
                        <div className="post-video-wrapper">
                            {/* Kiểm tra đuôi file nếu là link trực tiếp */}
                            {post.videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video controls className="post-video">
                                    <source src={post.videoUrl} type={`video/${post.videoUrl.split('.').pop()}`} />
                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                </video>
                            ) : (
                                // Placeholder cho các link video khác (YouTube, etc.)
                                <div className="post-video-placeholder">
                                    <a href={post.videoUrl} target="_blank" rel="noopener noreferrer">Xem video tại đây</a>
                                    {/* Bạn có thể thêm logic để nhúng iframe cho YouTube/Vimeo nếu muốn */}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Phần Actions: Nút Like, Comment, Share */}
            <div className="post-item-actions">
                <button onClick={handleLike} className="action-button like-button" aria-label="Thích bài đăng">
                    {/* Thay bằng SVG Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    {/* <span>Thích</span> */}
                </button>
                <button onClick={handleComment} className="action-button comment-button" aria-label="Bình luận bài đăng">
                    {/* Thay bằng SVG Icon */}
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>
                    {/* <span>Bình luận</span> */}
                </button>
                <button onClick={handleShare} className="action-button share-button" aria-label="Chia sẻ bài đăng">
                    {/* Thay bằng SVG Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                    {/* <span>Chia sẻ</span> */}
                </button>
                {/* Nút Lưu (Bookmark) - Thêm ở đây nếu cần */}
                 {/* <button className="action-button bookmark-button" aria-label="Lưu bài đăng">...</button> */}
            </div>

            {/* Phần hiển thị số lượt thích */}
            {post.likes && post.likes.length > 0 && (
                <div className="post-item-likes">
                    <strong>{post.likes.length} lượt thích</strong>
                </div>
            )}

            {/* Phần Nội dung/Caption */}
            {post.content && (
                <div className="post-item-content">
                    {/* Link đến profile user */}
                    <Link to={userInfo._id ? `/profile/${userInfo.username}` : '#'} className="username-caption">
                        {userInfo.username}
                    </Link>
                    {/* Nội dung caption */}
                    <span className="caption">{post.content}</span>
                </div>
            )}

            {/* Phần xem bình luận */}
            {post.comments && post.comments.length > 0 && (
                 <div className="post-item-view-comments">
                    {/* Link đến trang chi tiết bài đăng */}
                    <Link to={`/post/${post._id}`}>
                        Xem tất cả {post.comments.length} bình luận
                    </Link>
                 </div>
            )}

             {/* Phần thêm bình luận nhanh (tùy chọn) */}
             {/* <div className="post-item-add-comment">
                <input type="text" placeholder="Thêm bình luận..." className="comment-input"/>
                <button className="comment-submit">Đăng</button>
             </div> */}
        </div>
    );
};

export default PostItem;
