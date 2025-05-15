import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import { BsHash } from 'react-icons/bs';

const AdBox = () => {
  const suggestedFriends = [
    {
      id: 1,
      username: "johndoe",
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      mutualFriends: 5
    },
    {
      id: 2,
      username: "janedoe",
      name: "Jane Doe", 
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      mutualFriends: 3
    },
    {
      id: 3,
      username: "alexsmith",
      name: "Alex Smith",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
      mutualFriends: 2
    }
  ];

  const trendingHashtags = [
    {
      id: 1,
      tag: "photography",
      postCount: 1234,
      isHot: true
    },
    {
      id: 2,
      tag: "travel",
      postCount: 856,
      isHot: true
    },
    {
      id: 3, 
      tag: "food",
      postCount: 654,
      isHot: false
    },
    {
      id: 4,
      tag: "art",
      postCount: 432,
      isHot: false
    }
  ];

  return (
    <div className="sidebar-suggestions">
      {/* Gợi ý kết bạn */}
      <div className="friends-suggestions">
        <div className="suggestions-header">
          <h3>Gợi ý bạn bè</h3>
          <Link to="/suggestions">Xem tất cả</Link>
        </div>
        
        <div className="suggestions-list">
          {suggestedFriends.map(friend => (
            <div key={friend.id} className="suggestion-item">
              <div className="user-info">
                <img src={friend.avatar} alt={friend.name} />
                <div className="user-details">
                  <Link to={`/${friend.username}`} className="username">@{friend.username}</Link>
                  <span className="name">{friend.name}</span>
                  <span className="mutual-friends">{friend.mutualFriends} bạn chung</span>
                </div>
              </div>
              <button className="follow-btn">
                <FaUserPlus /> Theo dõi
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtags nổi bật */}
      <div className="trending-hashtags">
        <div className="suggestions-header">
          <h3>Hashtags nổi bật</h3>
          <Link to="/trending">Khám phá thêm</Link>
        </div>
        
        <div className="hashtags-list">
          {trendingHashtags.map(tag => (
            <Link to={`/tag/${tag.tag}`} key={tag.id} className="hashtag-item">
              <div className="hashtag-info">
                <BsHash className="hash-icon" />
                <span className="tag-name">{tag.tag}</span>
                {tag.isHot && <span className="hot-badge">🔥 Hot</span>}
              </div>
              <span className="post-count">{tag.postCount.toLocaleString()} bài viết</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdBox;
