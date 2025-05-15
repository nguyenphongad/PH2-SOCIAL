import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPostDetail } from '../../redux/thunks/postThunk';
import PostDetailModal from './PostDetailModal';
import LoadingText from '../../components/loadingComponent.js/LoadingText';
import NotFoundPages from '../authPages/NotFoundPages';

const PostDetailPage = ({ isModal = false }) => {
    const { postId } = useParams();
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    
    const postState = useSelector(state => state.post || {});
    const { currentPost, status, error } = postState;
    
    // Lấy background location từ state
    const background = location.state?.backgroundLocation;
    
    // Fetch bài viết khi component mount
    useEffect(() => {
        if (postId) {
            dispatch(getPostDetail(postId));
        }
    }, [postId, dispatch]);
    
    // Xử lý đóng modal/trang
    const handleClose = () => {
        setIsVisible(false);
        
        setTimeout(() => {
            if (background) {
                // Quay lại trang trước đó khi đóng modal
                navigate(background.pathname, { 
                    replace: true 
                });
            } else {
                // Nếu là trang đầy đủ hoặc không có background, quay lại trang trước đó
                navigate(-1);
            }
        }, 200);
    };

    // Loading state
    if (status === 'loading') {
        return <LoadingText text="Đang tải bài viết..." />;
    }
    
    // Error state - chỉ hiển thị NotFound khi đã thử tải và xác định bài viết không tồn tại
    if (status === 'failed' || (status === 'succeeded' && !currentPost)) {
        return (
            <div className="post-not-found">
                <NotFoundPages />
            </div>
        );
    }
    
    // Đảm bảo currentPost tồn tại trước khi render
    if (!currentPost) {
        return null;
    }

    // Nếu là modal (mở từ một trang khác qua location state)
    if (isModal || background) {
        return (
            <PostDetailModal 
                isVisible={isVisible} 
                post={currentPost}
                onClose={handleClose}
                isFullPage={false}
            />
        );
    }

    // Nếu truy cập trực tiếp URL hoặc refresh trang
    return (
        <div className="post-detail-standalone">
            <PostDetailModal 
                isVisible={true}
                post={currentPost}
                onClose={handleClose}
                isFullPage={true}
            />
        </div>
    );
};

export default PostDetailPage;
