import React, { useState } from "react";
import { FaShare, FaRegHeart, FaHeart, FaRegComment, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleLike } from "../../redux/thunks/postThunk";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const PostItem = ({ post }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasMultipleImages = post.imageUrls && post.imageUrls.length > 1;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Kiểm tra xem user hiện tại đã like bài viết chưa
  const isLikedByCurrentUser = post.isLikedByCurrentUser || false;
  
  // Lấy thông tin user từ cấu trúc mới
  const userData = post.user || {};

  // Xử lý chuyển slide
  const nextSlide = (e) => {
    e.stopPropagation();
    if (currentSlide < post.imageUrls.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Chọn thumbnail/dot
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Hàm xử lý khi click vào bài viết để mở chi tiết
  const handlePostClick = () => {
    console.log("Navigating to post detail with background:", location.pathname);
    navigate(`/post/${post._id}`, {
      state: { backgroundLocation: location }
    });
  };

  // Ngăn sự kiện lan truyền khi click vào link username
  const handleUserLinkClick = (e) => {
    e.stopPropagation(); // Đảm bảo không kích hoạt sự kiện click vào bài viết
  };

  // Xử lý khi click vào button like
  const handleLikeClick = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan đến bài viết
    dispatch(toggleLike(post._id));
  };

  // Thêm hàm xử lý khi click vào nút comment
  const handleCommentClick = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan đến bài viết
    console.log("Navigating to comment with background:", location.pathname);
    // Điều hướng đến trang chi tiết bài viết với modal
    navigate(`/post/${post._id}`, {
      state: { 
        backgroundLocation: location,
        openCommentBox: true // Thêm flag để mở hộp comment khi modal mở
      }
    });
  };

  return (
    <div className="post" onClick={handlePostClick}>
      <div className="post__header" onClick={(e) => e.stopPropagation()}>
        <Link 
          to={`/${userData.username || post.username}`} 
          className="post__user-info"
          onClick={handleUserLinkClick}
        >
          {/* Sử dụng avatarUrl từ đối tượng user */}
          <img 
            src={userData.profilePicture || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
            alt="" 
            className="post__avatar" 
          />
          <div className="post__user-details">
            <strong className="post__username">{userData.username || post.username}</strong>
            <span className="post__time">{dayjs(post.createdAt).fromNow()}</span>
          </div>
        </Link>
        <button className="post__more-btn">•••</button>
      </div>
      
      <div className="post__content">
        {post.content}
      </div>

      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="post__image">
          <div className="post-image-slider">
            {post.imageUrls.map((url, index) => (
              <div
                key={index}
                className={`post-slide-item ${index === currentSlide ? 'active' : ''}`}
              >
                {index === currentSlide && (
                  <img src={url} alt={`post media ${index}`} />
                )}
              </div>
            ))}

            {hasMultipleImages && (
              <>
                <button
                  className={`slider-nav prev ${currentSlide === 0 ? 'disabled' : ''}`}
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                >
                  <FaArrowLeft />
                </button>
                <button
                  className={`slider-nav next ${currentSlide === post.imageUrls.length - 1 ? 'disabled' : ''}`}
                  onClick={nextSlide}
                  disabled={currentSlide === post.imageUrls.length - 1}
                >
                  <FaArrowRight />
                </button>

                <div className="post-image-counter">
                  {currentSlide + 1}/{post.imageUrls.length}
                </div>

                <div className="post-image-dots">
                  {post.imageUrls.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSlide(index);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="post__actions" onClick={(e) => e.stopPropagation()}>
        <div className="post__actions-left">
          <button className={`action-btn ${isLikedByCurrentUser ? 'liked' : ''}`} onClick={handleLikeClick}>
            {isLikedByCurrentUser ? (
              <FaHeart className="icon liked-icon" /> // Icon trái tim đặc khi đã like
            ) : (
              <FaRegHeart className="icon" /> // Icon trái tim rỗng khi chưa like
            )}
            <span>{post.likes?.length || 0}</span>
          </button>
          {/* Cập nhật nút comment để sử dụng handleCommentClick */}
          <button className="action-btn" onClick={handleCommentClick}>
            <FaRegComment className="icon" />
            <span>{post.comments?.length || 0}</span>
          </button>
          <button className="action-btn">
            <FaShare className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
