import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaRegHeart, FaHeart, FaRegComment, FaShare, FaPaperPlane } from 'react-icons/fa';
import { getPostDetail, toggleLike, addComment, getComments } from '../../redux/thunks/postThunk';
import './PostDetailModal.scss'; // Tạo file CSS tương ứng
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PostDetailModal = ({ postId, onClose, openCommentBox = false }) => {
  const dispatch = useDispatch();
  const { currentPost: post, commentStatus } = useSelector(state => state.post);
  const comments = useSelector(state => state.post.comments[postId] || []);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Tự động mở focus vào input comment nếu openCommentBox=true
  const commentInputRef = React.useRef(null);

  useEffect(() => {
    // Fetch chi tiết bài viết
    dispatch(getPostDetail(postId));
    
    // Fetch comments
    dispatch(getComments(postId));
    
    // Thêm event listener để đóng modal khi nhấn Escape
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [dispatch, postId, onClose]);
  
  // Focus vào ô comment nếu cần
  useEffect(() => {
    if (openCommentBox && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 300);
    }
  }, [openCommentBox, post]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLikeClick = () => {
    if (post) {
      dispatch(toggleLike(postId));
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    dispatch(addComment({ postId, content: commentText }))
      .unwrap()
      .then(() => {
        setCommentText('');
        dispatch(getComments(postId));
      })
      .finally(() => {
        setIsSubmittingComment(false);
      });
  };

  if (!post) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="post-detail-modal loading">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  const isLikedByCurrentUser = post.isLikedByCurrentUser || false;
  const hasMultipleImages = post.imageUrls && post.imageUrls.length > 1;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="post-detail-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="post-detail-content">
          {/* Left side - Post media */}
          <div className="post-media">
            {post.imageUrls && post.imageUrls.length > 0 ? (
              <div className="image-slider">
                <img 
                  src={post.imageUrls[currentSlide]} 
                  alt="Post media" 
                  className="post-image"
                />
                
                {/* Navigation arrows for multiple images */}
                {hasMultipleImages && (
                  <>
                    <button 
                      className={`slider-arrow prev ${currentSlide === 0 ? 'disabled' : ''}`}
                      onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                      disabled={currentSlide === 0}
                    >
                      &lt;
                    </button>
                    <button 
                      className={`slider-arrow next ${currentSlide === post.imageUrls.length - 1 ? 'disabled' : ''}`}
                      onClick={() => setCurrentSlide(prev => Math.min(post.imageUrls.length - 1, prev + 1))}
                      disabled={currentSlide === post.imageUrls.length - 1}
                    >
                      &gt;
                    </button>
                    
                    <div className="image-counter">
                      {currentSlide + 1}/{post.imageUrls.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="no-image-placeholder">
                <p>Không có hình ảnh</p>
              </div>
            )}
          </div>
          
          {/* Right side - Post info and comments */}
          <div className="post-info">
            {/* Post header */}
            <div className="post-header">
              <div className="user-info">
                <img src={post.profilePicture} alt="" className="user-avatar" />
                <div>
                  <h3 className="username">{post.username}</h3>
                  <span className="post-time">{dayjs(post.createdAt).fromNow()}</span>
                </div>
              </div>
              <button className="more-options">•••</button>
            </div>
            
            {/* Post content */}
            <div className="post-text-content">
              {post.content}
            </div>
            
            {/* Comments section */}
            <div className="comments-section">
              <h4>Bình luận</h4>
              
              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment._id} className="comment">
                      <img src="https://via.placeholder.com/30" alt="" className="comment-avatar" />
                      <div className="comment-content">
                        <div className="comment-author">{comment.username}</div>
                        <div className="comment-text">{comment.content}</div>
                        <div className="comment-time">{dayjs(comment.createdAt).fromNow()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                )}
                
                {commentStatus === 'loading' && (
                  <div className="loading-comments">Đang tải bình luận...</div>
                )}
              </div>
              
              {/* Post actions */}
              <div className="post-actions">
                <button 
                  className={`action-btn ${isLikedByCurrentUser ? 'liked' : ''}`} 
                  onClick={handleLikeClick}
                >
                  {isLikedByCurrentUser ? (
                    <FaHeart className="icon liked-icon" />
                  ) : (
                    <FaRegHeart className="icon" />
                  )}
                  <span>{post.likes?.length || 0} thích</span>
                </button>
                
                <button className="action-btn">
                  <FaShare className="icon" />
                  <span>Chia sẻ</span>
                </button>
              </div>
              
              {/* Add comment form */}
              <form className="add-comment-form" onSubmit={handleCommentSubmit}>
                <input
                  type="text"
                  ref={commentInputRef}
                  placeholder="Thêm bình luận..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmittingComment}
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim() || isSubmittingComment}
                  className={commentText.trim() ? 'active' : ''}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
