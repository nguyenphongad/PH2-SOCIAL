import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPostDetail } from '../../redux/thunks/postThunk';
import LoadingText from '../../components/loadingComponent.js/LoadingText';
import PostDetailModal from './PostDetailModal';

const PostDetailPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [localLoading, setLocalLoading] = useState(true);
  
  // Kiểm tra có phải là truy cập trực tiếp không
  const isDirectAccess = !location.state?.backgroundLocation;
  
  // Lấy thông tin bài viết từ Redux store
  const { currentPost, status, error } = useSelector(state => state.post);
  
  useEffect(() => {
    // Set loading state
    setLocalLoading(true);
    
    // Luôn fetch dữ liệu khi component mount hoặc postId thay đổi
    if (postId) {
      console.log("Fetching post detail for ID:", postId);
      dispatch(getPostDetail(postId))
        .unwrap()
        .then(result => {
          console.log("Fetch result:", result);
          setLocalLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setLocalLoading(false);
        });
    }
  }, [postId, dispatch]);
  
  // Xử lý quay lại
  const handleGoBack = () => {
    navigate('/');
  };

  // Hiển thị loading khi đang fetch
  if (localLoading || status === 'loading') {
    return <div className="post-detail-page-container"><LoadingText text="Đang tải bài viết..." /></div>;
  }
  
  // Hiển thị lỗi nếu có
  if (status === 'failed') {
    return (
      <div className="post-detail-page-container error-container">
        <h3>Không thể tải bài viết</h3>
        <p>{error}</p>
        <button onClick={handleGoBack}>Quay lại trang chủ</button>
      </div>
    );
  }
  
  // Nếu là truy cập qua modal (background), không hiển thị gì cả
  // vì modal đã được hiển thị qua Routes ngoài
  if (!isDirectAccess) {
    return null;
  }
  
  // Nếu không tìm thấy bài viết
  if (!currentPost) {
    return (
      <div className="post-detail-page-container error-container">
        <h3>Không tìm thấy bài viết</h3>
        <p>Bài viết có thể đã bị xóa hoặc không tồn tại</p>
        <button onClick={handleGoBack}>Quay lại trang chủ</button>
      </div>
    );
  }
  
  // Nếu là truy cập trực tiếp và đã có bài viết, hiển thị modal
  return (
    <div className="post-detail-standalone">
      <PostDetailModal 
        postId={postId} 
        onClose={handleGoBack}
        isVisible={true}
      />
    </div>
  );
};

export default PostDetailPage;
