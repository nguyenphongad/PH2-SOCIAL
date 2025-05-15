import React from 'react';

const ProfileSkeleton = ({ isMe }) => {
  return (
    <div className="profile-skeleton">
      <div className="profile-header-skeleton">
        <div className="profile-avatar-skeleton shine"></div>
        
        <div className="profile-info-skeleton">
          <div className="username-skeleton shine"></div>
          
          <div className="stats-skeleton">
            <div className="stat-skeleton shine"></div>
            <div className="stat-skeleton shine"></div>
            <div className="stat-skeleton shine"></div>
          </div>
          
          <div className="name-skeleton shine"></div>
          <div className="bio-skeleton shine"></div>
          
          <div className="actions-skeleton">
            {isMe ? (
              <>
                <div className="action-skeleton shine"></div>
                <div className="action-skeleton shine"></div>
              </>
            ) : (
              <>
                <div className="action-skeleton shine"></div>
                <div className="action-skeleton shine"></div>
                <div className="action-skeleton-small shine"></div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="tabs-skeleton">
        <div className="tab-skeleton shine"></div>
      </div>
      
      <div className="posts-grid-skeleton">
        {Array(9).fill().map((_, index) => (
          <div key={index} className="post-skeleton shine"></div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSkeleton;
