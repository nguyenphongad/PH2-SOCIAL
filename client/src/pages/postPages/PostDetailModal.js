import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaComment, FaArrowLeft, FaArrowRight, FaShare, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getPostDetail, addComment } from '../../redux/thunks/postThunk';
import LoadingText from '../../components/loadingComponent.js/LoadingText';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const PostDetailModal = ({ isVisible, post, onClose, isFullPage = false }) => {
    const { postId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Lấy bài viết từ Redux store
    const { currentPost, status } = useSelector(state => state.post || {});
    
    // Fetch bài viết khi component mount
    useEffect(() => {
        if (postId) {
            dispatch(getPostDetail(postId));
        }
    }, [postId, dispatch]);
    
    // Reset current slide when post changes
    useEffect(() => {
        if (post?._id) {
            setCurrentSlide(0);
        }
    }, [post?._id]);
    
    // Xử lý đóng modal
    const handleClose = () => {
        // Sử dụng navigate(-1) để quay lại trang trước đó
        navigate(-1);
    };
    
    // Xử lý chuyển slide
    const nextSlide = (e) => {
        if (e) e.stopPropagation();
        if (currentPost?.imageUrls && currentSlide < currentPost.imageUrls.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };
    
    const prevSlide = (e) => {
        if (e) e.stopPropagation();
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };
    
    // Chuyển đến slide cụ thể
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };
    
    // Xử lý submit bình luận
    const handleSubmitComment = async () => {
        if (!commentText.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await dispatch(addComment({
                postId: currentPost._id,
                content: commentText.trim()
            })).unwrap();
            
            setCommentText('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hiển thị loading khi đang tải dữ liệu
    if (status === 'loading') {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <LoadingText text="Đang tải bài viết..." />
                </div>
            </div>
        );
    }

    // Nếu không tìm thấy bài viết
    if (!currentPost) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="error-message">
                        <h3>Không tìm thấy bài viết</h3>
                        <button onClick={handleClose}>Quay lại</button>
                    </div>
                </div>
            </div>
        );
    }

    // Không tiếp tục render nếu không có post data
    if (!post || !post._id) return null;

    // Render modal với đầy đủ thông tin bài viết
    return (
        <div className="modal-overlay">
            <div className="modal-content post-detail-modal">
                <div className="post-detail-container">
                    <div className="post-detail-media">
                        {currentPost.imageUrls && currentPost.imageUrls.length > 0 ? (
                            <div className="post-image-slider">
                                {currentPost.imageUrls.map((url, index) => (
                                    <div
                                        key={index}
                                        className={`post-slide-item ${index === currentSlide ? 'active' : ''}`}
                                    >
                                        {index === currentSlide && (
                                            <img src={url} alt={`post media ${index}`} />
                                        )}
                                    </div>
                                ))}

                                {currentPost.imageUrls.length > 1 && (
                                    <>
                                        <button
                                            className={`slider-nav prev ${currentSlide === 0 ? 'disabled' : ''}`}
                                            onClick={prevSlide}
                                            disabled={currentSlide === 0}
                                        >
                                            <FaArrowLeft />
                                        </button>
                                        <button
                                            className={`slider-nav next ${currentSlide === currentPost.imageUrls.length - 1 ? 'disabled' : ''}`}
                                            onClick={nextSlide}
                                            disabled={currentSlide === currentPost.imageUrls.length - 1}
                                        >
                                            <FaArrowRight />
                                        </button>

                                        <div className="post-image-counter">
                                            {currentSlide + 1}/{currentPost.imageUrls.length}
                                        </div>

                                        <div className="post-image-dots">
                                            {currentPost.imageUrls.map((_, index) => (
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
                        ) : (
                            <div className="text-only-post-detail">
                                <p>{currentPost.content}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="post-detail-info">
                        <div className="post-detail-header">
                            <Link to={`/${currentPost.username}`} className="post-user-info">
                                <img src={currentPost.profilePicture} alt="" className="post-avatar" />
                                <div className="post-user-details">
                                    <strong className="post-username">{currentPost.username}</strong>
                                    <span className="post-time">{dayjs(currentPost.createdAt).fromNow()}</span>
                                </div>
                            </Link>
                            <button className="post-close-btn" onClick={handleClose} title="Đóng">
                                <FaTimesCircle />
                            </button>
                        </div>
                        
                        <div className="post-detail-content">
                            {currentPost.content && (
                                <p className="post-content-text">{currentPost.content}</p>
                            )}
                        </div>
                        
                        <div className="post-detail-actions">
                            <button className="action-btn">
                                <FaRegHeart className="icon" />
                                <span>{currentPost.likes?.length || 0}</span>
                            </button>
                            <button className="action-btn">
                                <FaComment className="icon" />
                                <span>{currentPost.comments?.length || 0}</span>
                            </button>
                            <button className="action-btn">
                                <FaShare className="icon" />
                            </button>
                        </div>
                        
                        <div className="post-detail-comments-section">
                            <h3>Bình luận</h3>
                            <div className="post-comments-list">
                                {currentPost.comments && currentPost.comments.length > 0 ? (
                                    currentPost.comments.map((comment) => (
                                        <div key={comment._id} className="comment-item">
                                            <Link to={`/${comment.username}`}>
                                                <img src={comment.userAvatar} alt="" className="comment-avatar" />
                                            </Link>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <Link to={`/${comment.username}`} className="comment-username">
                                                        {comment.username}
                                                    </Link>
                                                    <span className="comment-time">
                                                        {dayjs(comment.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                                <p className="comment-text">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                                )}
                            </div>
                            <div className="comment-form">
                                <textarea 
                                    placeholder="Thêm bình luận..." 
                                    className="comment-input"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button 
                                    className="comment-submit-btn"
                                    onClick={handleSubmitComment}
                                    disabled={!commentText.trim() || isSubmitting}
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Đăng'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(PostDetailModal); // Memoize component để tránh re-render không cần thiết
