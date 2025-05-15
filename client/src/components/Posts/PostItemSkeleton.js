import React from "react";

const PostItemSkeleton = () => (
  <div className="post post-skeleton">
    <div className="post__header">
      <div className="post__user-info">
        <div className="post__avatar skeleton"></div>
        <div className="post__user-details">
          <div className="post__username skeleton"></div>
          <div className="post__time skeleton"></div>
        </div>
      </div>
      <div className="post__more-btn skeleton"></div>
    </div>

    <div className="post__image">
      <div className="post__image-skeleton skeleton"></div>
    </div>

    <div className="post__actions">
      <div className="post__actions-left">
        <div className="action-btn skeleton"></div>
        <div className="action-btn skeleton"></div>
        <div className="action-btn skeleton"></div>
      </div>
    </div>

    <div className="post__content">
      <div className="post__content-skeleton skeleton"></div>
    </div>
  </div>
);

export default PostItemSkeleton;
