import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPosts } from '../../redux/thunks/postThunk';
import { FaHeart, FaComment } from 'react-icons/fa';

function PostMeComponent({ username }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const postState = useSelector(state => state.post || {});
    const posts = postState.items || [];
    const status = postState.status || 'idle';
    const isLoading = status === 'loading';
    
    // Effect để tải bài viết của người dùng khi component mount và khi username thay đổi
    useEffect(() => {
        if (username) {
            dispatch(getUserPosts(username));
        }
    }, [dispatch, username]);
    
    // Xử lý khi click vào bài viết - điều hướng đến đường dẫn bài viết với location state
    const handlePostClick = (postId) => {
        // Thay đổi cách truyền state để sử dụng backgroundLocation thay vì background
        navigate(`/post/${postId}`, {
            state: { backgroundLocation: location }
        });
    };

    // Render loading UI
    if (isLoading) {
        return (
            <div className="posts-loading-container">
                {Array(9).fill().map((_, index) => (
                    <div key={index} className="post-skeleton shine"></div>
                ))}
            </div>
        );
    }

    // Render empty state UI
    if (!posts || posts.length === 0) {
        return (
            <div className="empty-posts">
                <div className="empty-illustration">📷</div>
                <h3>Chưa có bài viết nào</h3>
                <p>Bài viết bạn đăng sẽ xuất hiện tại đây</p>
            </div>
        );
    }

    // Render grid posts
    return (
        <>
            <div className="posts-grid">
                {posts.map((post) => (
                    <div 
                        key={post._id} 
                        className="post-card" 
                        onClick={() => handlePostClick(post._id)}
                    >
                        {post.imageUrls && post.imageUrls.length > 0 ? (
                            <img 
                                src={post.imageUrls[0]} 
                                alt={post.content || 'Post image'} 
                                loading="lazy" 
                            />
                        ) : (
                            <div className="text-only-post">
                                <p>{post.content}</p>
                            </div>
                        )}
                        
                        {post.imageUrls && post.imageUrls.length > 1 && (
                            <div className="multiple-images-indicator">+{post.imageUrls.length}</div>
                        )}
                        
                        <div className="post-overlay">
                            <div className="post-stats">
                                <div className="stat">
                                    <FaHeart className="stat-icon" /> <span>{post.likes?.length || 0}</span>
                                </div>
                                <div className="stat">
                                    <FaComment className="stat-icon" /> <span>{post.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default PostMeComponent;