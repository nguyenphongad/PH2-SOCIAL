import React from "react";

const PostItem = ({ post }) => (
  <div className="post">
    <div className="post__header">
      <div className="post__user">
        <strong>{post.username}</strong>
      </div>
    </div>

    <div className="post__image">
      {post.imageUrl && <img src={post.imageUrl} alt="post media" />}
    </div>

    <div className="post__content">
      <p>{post.content}</p>
    </div>

    <div className="post__footer">
      <div className="post__actions">
        <span className="post__likes">Likes: {post.likes.length}</span>
        <span className="post__comments">Comments: {post.comments.length}</span>
      </div>
    </div>
  </div>
);

export default PostItem;
