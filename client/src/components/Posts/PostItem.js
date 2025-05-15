import React from "react";
import { FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegComment } from "react-icons/fa6";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const PostItem = ({ post }) => (
  <div className="post">
    <div className="post__header">
      <Link to={`/${post.username}`} className="post__user-info">
        <img src={post.profilePicture} alt="" className="post__avatar" />
        <div className="post__user-details">
          <strong className="post__username">{post.username}</strong>
          <span className="post__time">{dayjs(post.createdAt).fromNow()}</span>
        </div>
      </Link>
      <button className="post__more-btn">•••</button>
    </div>

    <div className="post__image">
      {post.imageUrl && <img src={post.imageUrl} alt="post media" />}
    </div>

    <div className="post__actions">
      <div className="post__actions-left">
        <button className="action-btn">
          <FaRegHeart className="icon" /> 
          <span>{post.likes.length}</span>
        </button>
        <button className="action-btn">
          <FaRegComment className="icon" />
          <span>{post.comments.length}</span>
        </button>
        <button className="action-btn">
          <FaShare className="icon" />
        </button>
      </div>
    </div>

    {/* <div className="post__content">
      <Link to={`/${post.username}`} className="post__username">
        {post.username}
      </Link>
      <span className="post__text">{post.content}</span>
    </div> */}
  </div>
);

export default PostItem;
