import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadFeed } from "../../redux/thunks/postThunk";
import PostItem from "../../components/Posts/PostItem";
import LoadingText from "../../components/loadingComponent.js/LoadingText";
import AdBox from "../../components/AdBox"; 
import PostItemSkeleton from "../../components/Posts/PostItemSkeleton"; 

const HomePageIndex = () => {
  const dispatch = useDispatch();
  // Sửa để khớp với tên slice trong store
  const postState = useSelector(state => state.post || {});
  const posts = postState.items || [];
  const status = postState.status || 'idle';
  const createStatus = postState.createStatus || 'idle';

  useEffect(() => {
    dispatch(loadFeed());
  }, [dispatch]);

  // Xác định nếu có bài đăng đang được tạo
  const isCreatingPost = createStatus === "loading";

  if (status === "loading" && posts.length === 0) {
    return <LoadingText text="Đang tải bài viết…" />;
  }
  
  if (status === "failed") {
    return <div className="error">Không thể tải bài viết. Vui lòng thử lại sau.</div>;
  }

  return (
    <div className="container_home">
      <div className="main-content">
        <div className="posts-feed">
          {/* Hiển thị skeleton loader cho bài đăng đang được tạo */}
          {isCreatingPost && <PostItemSkeleton />}
          
          {/* Hiển thị danh sách bài đăng */}
          {posts.map(post => (
            <PostItem key={post._id} post={post} />
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
  );
};

export default HomePageIndex;
