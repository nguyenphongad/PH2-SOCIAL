import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaComment, FaArrowLeft, FaArrowRight, FaShare, FaTimesCircle, FaEllipsisV, FaPencilAlt, FaTrashAlt, FaLink } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getPostDetail, addComment, toggleLike, deletePost } from '../../redux/thunks/postThunk';
import { clearCurrentPost } from '../../redux/slices/postSlice';
import LoadingText from '../../components/loadingComponent.js/LoadingText';
import { Dropdown } from 'antd'; // Đã loại bỏ Alert và message từ Ant Design
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "dayjs/locale/vi";
import PostModal from './PostModal';
import CommentSuggestions from '../../components/Comments/CommentSuggestions';
import ModalEventCatcher from '../../components/Modal/ModalEventCatcher';

dayjs.extend(relativeTime);
dayjs.locale("vi");

const PostDetailModal = ({ isVisible, postId: modalPostId, onClose, openCommentBox = false }) => {
    // Lấy postId từ URL params (nếu có)
    const { postId: urlPostId } = useParams();
    // Sử dụng modalPostId (từ props) hoặc urlPostId (từ URL)
    const postId = modalPostId || urlPostId;
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [localCurrentPost, setLocalCurrentPost] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [localLoading, setLocalLoading] = useState(true);
    const [localComments, setLocalComments] = useState([]);
    
    // Tạo ref cho input comment
    const commentInputRef = React.useRef(null);
    
    // Lấy bài viết từ Redux store
    const { currentPost, status } = useSelector(state => state.post || {});
    
    // Xử lý đóng modal - Di chuyển lên trước khi sử dụng trong useEffect
    const handleClose = useCallback(() => {
        // Reset state
        setLocalCurrentPost(null);
        setCurrentSlide(0);
        setCommentText('');
        
        // Xóa currentPost trong Redux
        dispatch(clearCurrentPost());
        
        // Sử dụng prop onClose nếu được truyền vào, ngược lại sẽ quay lại trang trước
        if (onClose) {
            onClose();
        } else {
            navigate(-1);
        }
    }, [dispatch, onClose, navigate]);
    
    // Thêm ref để focus vào phần comments khi cần
    const commentsContainerRef = useRef(null);
    
    // Hàm để scroll đến phần bình luận (cho mobile)
    const scrollToComments = useCallback(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);
    
    // Reset trạng thái khi postId thay đổi
    useEffect(() => {
        // Đánh dấu đang tải và xóa dữ liệu bài viết hiện tại trong local state
        if (postId) {
            setLocalLoading(true);
            setLocalCurrentPost(null);
            setCurrentSlide(0);
        }
    }, [postId]);
    
    // Fetch bài viết khi component mount hoặc postId thay đổi
    useEffect(() => {
        if (postId) {
            // Luôn gọi getPostDetail khi postId thay đổi
            dispatch(getPostDetail(postId))
                .unwrap()
                .then(() => {
                    setLocalLoading(false);
                })
                .catch(() => {
                    setLocalLoading(false);
                });
        }
        
        // Cleanup khi unmount - xóa currentPost trong redux
        return () => {
            dispatch(clearCurrentPost());
        };
    }, [postId, dispatch]);
    
    // Cập nhật local state từ redux state
    useEffect(() => {
        if (currentPost && currentPost._id === postId) {
            setLocalCurrentPost(currentPost);
            // Khởi tạo localComments từ comments của post
            if (currentPost.comments) {
                setLocalComments(currentPost.comments);
            }
            setLocalLoading(false);
        }
    }, [currentPost, postId]);
    
    // Focus vào ô comment nếu cần
    useEffect(() => {
        if (openCommentBox && commentInputRef.current && localCurrentPost) {
            setTimeout(() => {
                commentInputRef.current.focus();
            }, 300);
        }
    }, [openCommentBox, localCurrentPost]);
    
    // Thêm hàm xử lý đóng modal bằng phím Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        
        // Đăng ký event listener
        window.addEventListener("keydown", handleKeyDown);
        
        // Cleanup khi unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleClose]);
    
    // Xử lý chuyển slide
    const nextSlide = (e) => {
        if (e) e.stopPropagation();
        if (localCurrentPost?.imageUrls && currentSlide < localCurrentPost.imageUrls.length - 1) {
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
            const result = await dispatch(addComment({
                postId: localCurrentPost._id,
                content: commentText.trim()
            })).unwrap();
            
            // Sử dụng toast thay vì alert của Ant Design
            toast.success('Đã thêm bình luận thành công');
            
            // Thêm bình luận mới vào mảng localComments
            if (result && result.comment) {
                // Sử dụng state updater function để đảm bảo không có vấn đề với state trước đó
                setLocalComments(prevComments => {
                    // Kiểm tra xem comment đã tồn tại chưa để tránh hiển thị trùng lặp
                    const commentExists = prevComments.some(c => c._id === result.comment._id);
                    if (commentExists) {
                        return prevComments;
                    }
                    return [...prevComments, result.comment];
                });
            }
            
            setCommentText('');
        } catch (error) {
            console.error('Failed to add comment:', error);
            toast.error('Không thể thêm bình luận: ' + (error.message || 'Đã xảy ra lỗi'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Xử lý khi click vào button like
    const handleLikeClick = () => {
        if (localCurrentPost) {
            dispatch(toggleLike(localCurrentPost._id));
        }
    };

    // Thêm state và logic để xử lý dropdown
    const currentUser = useSelector(state => state.auth.user);
    
    // Xử lý xóa bài viết
    const handleDeletePost = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            dispatch(deletePost(localCurrentPost._id))
                .unwrap()
                .then(() => {
                    toast.success("Xóa bài viết thành công");
                    handleClose(); // Đóng modal sau khi xóa thành công
                })
                .catch((error) => {
                    toast.error("Xóa bài viết thất bại: " + (error.message || "Đã xảy ra lỗi"));
                });
        }
    };

    // Xử lý chỉnh sửa bài viết
    const handleEditPost = () => {
        setIsEditModalVisible(true);
    };

    // Xử lý sao chép liên kết
    const handleCopyLink = () => {
        const postUrl = `${window.location.origin}/post/${localCurrentPost._id}`;
        navigator.clipboard.writeText(postUrl)
            .then(() => {
                toast.success("Đã sao chép liên kết bài viết");
            })
            .catch(() => {
                toast.error("Không thể sao chép liên kết");
            });
    };
    
    // Tạo menu items cho Dropdown
    const getDropdownItems = () => {
        const items = [];
        
        // Chỉ hiển thị tùy chọn sửa/xóa nếu bài viết thuộc về người dùng hiện tại
        const isCurrentUserPost = currentUser?.userID === localCurrentPost?.user?.userID || 
                                  currentUser?.userID === localCurrentPost?.userID;
        
        if (isCurrentUserPost) {
            items.push(
                { 
                    key: 'edit',
                    label: 'Chỉnh sửa', 
                    icon: <FaPencilAlt />,
                    onClick: handleEditPost
                },
                { 
                    key: 'delete',
                    label: 'Xóa bài viết',
                    icon: <FaTrashAlt />,
                    danger: true,
                    onClick: handleDeletePost
                }
            );
        }
        
        items.push({ 
            key: 'copyLink',
            label: 'Sao chép liên kết',
            icon: <FaLink />,
            onClick: handleCopyLink
        });
        
        return items;
    };

    // Xử lý khi người dùng chọn một gợi ý bình luận
    const handleSelectSuggestion = (suggestion) => {
        setCommentText(suggestion);
        
        // Tự động focus vào textarea
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    // Thêm state để quản lý hiển thị gợi ý
    const [showSuggestions, setShowSuggestions] = useState(true);
    
    // Hàm toggle hiển thị gợi ý
    const toggleSuggestions = () => {
        setShowSuggestions(prev => !prev);
    };

    // Hiển thị loading khi đang tải dữ liệu
    if (localLoading || status === 'loading') {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <LoadingText text="Đang tải bài viết..." />
                </div>
            </div>
        );
    }

    // Nếu không tìm thấy bài viết
    if (!localCurrentPost) {
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

    // Render modal với đầy đủ thông tin bài viết
    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content post-detail-modal" onClick={(e) => e.stopPropagation()}>
                {/* Thêm nút đóng modal ở góc phải trên */}
                <button 
                    className="modal-close-btn" 
                    onClick={handleClose}
                    aria-label="Close modal"
                >
                    <FaTimesCircle />
                </button>
                
                <div className="post-detail-container">
                    <div className="post-detail-media">
                        {localCurrentPost.imageUrls && localCurrentPost.imageUrls.length > 0 ? (
                            <div className="post-image-slider">
                                {localCurrentPost.imageUrls.map((url, index) => (
                                    <div
                                        key={index}
                                        className={`post-slide-item ${index === currentSlide ? 'active' : ''}`}
                                    >
                                        {index === currentSlide && (
                                            <img src={url} alt={`post media ${index}`} />
                                        )}
                                    </div>
                                ))}

                                {localCurrentPost.imageUrls.length > 1 && (
                                    <>
                                        <button
                                            className={`slider-nav prev ${currentSlide === 0 ? 'disabled' : ''}`}
                                            onClick={prevSlide}
                                            disabled={currentSlide === 0}
                                        >
                                            <FaArrowLeft />
                                        </button>
                                        <button
                                            className={`slider-nav next ${currentSlide === localCurrentPost.imageUrls.length - 1 ? 'disabled' : ''}`}
                                            onClick={nextSlide}
                                            disabled={currentSlide === localCurrentPost.imageUrls.length - 1}
                                        >
                                            <FaArrowRight />
                                        </button>

                                        <div className="post-image-counter">
                                            {currentSlide + 1}/{localCurrentPost.imageUrls.length}
                                        </div>

                                        <div className="post-image-dots">
                                            {localCurrentPost.imageUrls.map((_, index) => (
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
                                <p>{localCurrentPost.content}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="post-detail-info">
                        <div className="post-detail-header">
                            <Link to={`/${localCurrentPost.user?.username || localCurrentPost.username}`} className="post-user-info">
                                <img 
                                    src={localCurrentPost.user?.profilePicture || localCurrentPost.profilePicture || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
                                    alt="" 
                                    className="post-avatar" 
                                />
                                <div className="post-user-details">
                                    <strong className="post-username">{localCurrentPost.user?.username || localCurrentPost.username}</strong>
                                    <span className="post-time">{dayjs(localCurrentPost.createdAt).fromNow()}</span>
                                </div>
                            </Link>
                            
                            <div className="post-detail-actions-header">
                                {/* Thêm nút tùy chọn ở modal chi tiết */}
                                <Dropdown 
                                    menu={{ items: getDropdownItems() }} 
                                    placement="bottomRight" 
                                    trigger={['click']}
                                >
                                    <button className="post-options-btn">
                                        <FaEllipsisV />
                                    </button>
                                </Dropdown>
                                
                                {/* Loại bỏ nút đóng trùng lặp ở đây */}
                            </div>
                        </div>
                        
                        <div className="post-detail-content">
                            {localCurrentPost.content && (
                                <p className="post-content-text">{localCurrentPost.content}</p>
                            )}
                        </div>
                        
                        <div className="post-detail-actions">
                            <button 
                                className={`action-btn ${localCurrentPost.isLikedByCurrentUser ? 'liked' : ''}`}
                                onClick={handleLikeClick}
                            >
                                {localCurrentPost.isLikedByCurrentUser ? (
                                    <FaHeart className="icon liked-icon" />
                                ) : (
                                    <FaRegHeart className="icon" />
                                )}
                                <span>{localCurrentPost.likes?.length || 0}</span>
                            </button>
                            <button className="action-btn">
                                <FaComment className="icon" />
                                <span>{localCurrentPost.comments?.length || 0}</span>
                            </button>
                            <button className="action-btn">
                                <FaShare className="icon" />
                            </button>
                        </div>
                        
                        {/* Thêm nút "Xem bình luận" chỉ hiển thị trên mobile */}
                        <div className="mobile-scroll-to-comments">
                            <button onClick={scrollToComments}>
                                <FaComment /> Xem bình luận ({localCurrentPost.comments?.length || 0})
                            </button>
                        </div>
                        
                        <div 
                            className="post-detail-comments-section" 
                            ref={commentsContainerRef}
                        >
                            <h3>Bình luận</h3>
                            
                            <div className="post-comments-list">
                                {localComments && localComments.length > 0 ? (
                                    localComments.map((comment) => (
                                        <div key={comment._id} className="comment-item">
                                            <Link to={`/${comment.username}`}>
                                                <img 
                                                    src={comment.userAvatar || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
                                                    alt="" 
                                                    className="comment-avatar" 
                                                />
                                            </Link>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <Link to={`/${comment.username}`} className="comment-username">
                                                        {comment.username || "Người dùng"}
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
                            
                            {/* Component gợi ý bình luận với props isVisible và onHide */}
                            <CommentSuggestions 
                                postContent={localCurrentPost.content} 
                                onSelectSuggestion={handleSelectSuggestion}
                                isVisible={showSuggestions}
                                onHide={() => setShowSuggestions(false)}
                            />
                            
                            <div className="comment-form">
                                <div className="comment-input-container">
                                    <textarea 
                                        ref={commentInputRef}
                                        placeholder="Thêm bình luận..." 
                                        className="comment-input"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    />
                                    {!showSuggestions && (
                                        <button 
                                            type="button"
                                            className="show-suggestions-btn" 
                                            onClick={toggleSuggestions}
                                            title="Hiển thị gợi ý bình luận"
                                        >
                                            Gợi ý
                                        </button>
                                    )}
                                </div>
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
            
            {/* Modal chỉnh sửa bài viết - Cập nhật đoạn này */}
            {isEditModalVisible && (
                <ModalEventCatcher>
                    <PostModal
                        visible={isEditModalVisible}
                        onClose={() => setIsEditModalVisible(false)}
                        user={currentUser}
                        isEditing={true}
                        existingPost={localCurrentPost}
                    />
                </ModalEventCatcher>
            )}
        </div>
    );
};

export default React.memo(PostDetailModal);
