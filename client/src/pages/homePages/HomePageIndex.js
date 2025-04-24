import React, { useEffect } from "react";
import "../../styles/PostPageStyle/PostPageIndex.scss";
import { useDispatch, useSelector } from "react-redux";
import { loadFeed } from "../../redux/thunks/postThunk";
import PostItem from "../../components/Posts/PostItem";
import LoadingText from "../../components/loadingComponent.js/LoadingText";


const HomePageIndex = () => {
  const dispatch = useDispatch();
  const { items: posts, status, error } = useSelector(s => s.post);

  useEffect(() => {
    dispatch(loadFeed());
  }, [dispatch]);

  if (status === "loading") return <LoadingText text="Đang tải bài viết…" />;
  if (status === "failed")  return <div className="error">{error}</div>;

  return (
    <div className="container_post">
      <div className="box_post">
        {posts.map(post => (
          <PostItem key={post._id} post={post} />
        ))}
      </div>
      <div className="box_ads">ads</div>
    </div>
  );
};

export default HomePageIndex;
