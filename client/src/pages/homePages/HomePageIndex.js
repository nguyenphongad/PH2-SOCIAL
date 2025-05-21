import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadFeed } from "../../redux/thunks/postThunk";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import PostItem from "../../components/Posts/PostItem";
import LoadingText from "../../components/loadingComponent.js/LoadingText";
import AdBox from "../../components/AdBox"; 
import PostItemSkeleton from "../../components/Posts/PostItemSkeleton"; 
import PostDetailModal from "../../pages/postPages/PostDetailModal"; // Sửa đường dẫn

const HomePageIndex = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  // Sửa để khớp với tên slice trong store
  const postState = useSelector(state => state.post || {});
  const posts = postState.items || [];
  const status = postState.status || 'idle';
  const createStatus = postState.createStatus || 'idle';
  
  // State để theo dõi bài post đang được xem modal
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);

  useEffect(() => {
    dispatch(loadFeed());
  }, [dispatch]);
  
  // Kiểm tra URL hiện tại để mở modal khi URL chứa /post/{id}
  useEffect(() => {
    const match = location.pathname.match(/\/post\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      setSelectedPostId(match[1]);
      // Kiểm tra nếu cần mở hộp comment
      if (location.state?.openCommentBox) {
        setIsCommentBoxOpen(true);
      }
    } else {
      setSelectedPostId(null);
      setIsCommentBoxOpen(false);
    }
  }, [location]);

  // Hàm đóng modal
  const handleCloseModal = () => {
    setSelectedPostId(null);
    setIsCommentBoxOpen(false);
    navigate(-1); // Quay lại trang trước đó
  };

  // Xác định nếu có bài đăng đang được tạo
  const isCreatingPost = createStatus === "loading";

  if (status === "loading" && posts.length === 0) {
    return <LoadingText text="Đang tải bài viết…" />;
  }
  
  if (status === "failed") {
    return <div className="error">Không thể tải bài viết. Vui lòng thử lại sau.</div>;
  }

  return (
    <>
      <div className="container_home">
        <div className="main-content">
          <div className="posts-feed">
            {/* Hiển thị skeleton loader cho bài đăng đang được tạo */}
            {isCreatingPost && <PostItemSkeleton />}
            
            {/* Hiển thị danh sách bài đăng */}
            {posts.map(post => (
              <PostItem 
                key={post._id} 
                post={post}
              />
            ))}
            
            {/* Hiển thị thông báo nếu không có bài đăng nào */}
            {!isCreatingPost && posts.length === 0 && (
              <div className="no-posts">
                <p>Chưa có bài viết nào. Hãy theo dõi nhiều người hơn hoặc đăng bài viết đầu tiên của bạn!</p>
              </div>
            )}
          </div>
          
          <div className="sidebar">
            <AdBox />
          </div>
        </div>
      </div>

      {/* Hiển thị modal chi tiết bài viết nếu có selectedPostId */}
      {selectedPostId && (
        <PostDetailModal 
          postId={selectedPostId} 
          onClose={handleCloseModal}
          openCommentBox={isCommentBoxOpen}
          isVisible={true}
        />
      )}
    </>
  );
};

export default HomePageIndex;
