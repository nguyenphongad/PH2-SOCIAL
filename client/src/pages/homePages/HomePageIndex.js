import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadFeed } from "../../redux/thunks/postThunk";
import PostItem from "../../components/Posts/PostItem";
import LoadingText from "../../components/loadingComponent.js/LoadingText";
import AdBox from "../../components/AdBox"; // Tạo component mới cho phần quảng cáo

const HomePageIndex = () => {
  const dispatch = useDispatch();
  const { items: posts, status, error } = useSelector(s => s.post);

  useEffect(() => {
    dispatch(loadFeed());
  }, [dispatch]);

  if (status === "loading") return <LoadingText text="Đang tải bài viết…" />;
  if (status === "failed")  return <div className="error">{error}</div>;

  // console.log(posts)

  return (
    <div className="container_home">
      <div className="main-content">
        <div className="posts-feed">
          {posts.map(post => (
            <PostItem key={post._id} post={post} />
          ))}
        </div>
        <div className="sidebar">
          <AdBox />
        </div>
      </div>
    </div>
  );
};

export default HomePageIndex;
