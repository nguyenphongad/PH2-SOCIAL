import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadFeed } from "../../redux/thunks/postThunk";
import { selectAllPosts, selectPostStatus, selectPostError } from "../../redux/slices/postSlice";
import PostItem from "./PostItem";

const FeedPosts = () => {
  const dispatch = useDispatch();
  const feedPosts = useSelector(selectAllPosts);
  const feedStatus = useSelector(selectPostStatus);
  const feedError = useSelector(selectPostError);
  const [currentUserId, setCurrentUserId] = useState(null); // Giả sử bạn có cách lấy userId hiện tại

  useEffect(() => {
    dispatch(loadFeed())
      .unwrap()
      .then(posts => {
        // Đảm bảo mỗi bài viết có trường isLikedByCurrentUser
        // Nếu backend không trả về trường này, bạn có thể xác định nó ở đây
        
        // Ví dụ nếu backend trả về danh sách likes chứa userId
        const postsWithLikeStatus = posts.map(post => ({
          ...post,
          isLikedByCurrentUser: post.likes?.includes(currentUserId) || false
        }));
        
        setFeedPosts(postsWithLikeStatus);
      })
      .catch(error => {
        console.error('Failed to load feed:', error);
      });
  }, [dispatch, currentUserId]);

  if (feedStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (feedStatus === "failed") {
    return <div>Error: {feedError}</div>;
  }

  return (
    <div className="feed-posts">
      {feedPosts.map(post => (
        <PostItem key={post._id} post={post} />
      ))}
    </div>
  );
};

export default FeedPosts;