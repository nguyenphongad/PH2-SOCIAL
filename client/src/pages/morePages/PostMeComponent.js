import React, { useState, useEffect } from 'react';
import { FaHeart, FaComment } from 'react-icons/fa';

function PostMeComponent() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch with demo data
        setTimeout(() => {
            setPosts(demoPostData);
            setIsLoading(false);
        }, 1000);
    }, []);

    if (isLoading) {
        return (
            <div className="posts-loading-container">
                {Array(9).fill().map((_, index) => (
                    <div key={index} className="post-skeleton shine"></div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="empty-posts">
                <div className="empty-illustration">📷</div>
                <h3>Chưa có bài viết nào</h3>
                <p>Bài viết bạn đăng sẽ xuất hiện tại đây</p>
                <button className="create-post-btn">Tạo bài viết đầu tiên</button>
            </div>
        );
    }

    return (
        <div className="posts-grid">
            {posts.map((post) => (
                <div key={post.id} className="post-card">
                    {post.type === 'image' ? (
                        <img src={post.media} alt={post.caption} loading="lazy" />
                    ) : (
                        <div className="video-container">
                            <video src={post.media} />
                            <span className="video-icon">▶</span>
                        </div>
                    )}
                    <div className="post-overlay">
                        <div className="post-stats">
                            <div className="stat">
                                <FaHeart className="stat-icon" /> <span>{post.likes}</span>
                            </div>
                            <div className="stat">
                                <FaComment className="stat-icon" /> <span>{post.comments}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Demo data for posts
const demoPostData = [
    {
        id: 1,
        type: 'image',
        media: 'https://images.unsplash.com/photo-1611262588024-d12430b98920',
        caption: 'Enjoying the sunset view!',
        likes: 245,
        comments: 14,
        timestamp: '2023-08-10T15:30:00Z',
    },
    {
        id: 2,
        type: 'image',
        media: 'https://images.unsplash.com/photo-1611262588024-d12430b98920',
        caption: 'Coffee time with friends',
        likes: 182,
        comments: 8,
        timestamp: '2023-08-08T10:15:00Z',
    },
    {
        id: 3,
        type: 'image',
        media: 'https://images.unsplash.com/photo-1560807707-8cc77767d783',
        caption: 'Weekend getaway',
        likes: 320,
        comments: 23,
        timestamp: '2023-08-05T18:45:00Z',
    },
    {
        id: 4,
        type: 'image',
        media: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
        caption: 'City lights',
        likes: 178,
        comments: 11,
        timestamp: '2023-08-03T21:20:00Z',
    },
    {
        id: 5,
        type: 'image',
        media: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee',
        caption: 'Exploring new places',
        likes: 289,
        comments: 19,
        timestamp: '2023-07-29T14:10:00Z',
    },
    {
        id: 6,
        type: 'video',
        media: 'https://example.com/videos/sample.mp4', // URL to a video
        caption: 'Fun moments!',
        likes: 412,
        comments: 31,
        timestamp: '2023-07-25T11:30:00Z',
    },
    {
        id: 7,
        type: 'image',
        media: 'https://images.unsplash.com/photo-1576678927484-cc907957088c',
        caption: 'Beach day',
        likes: 230,
        comments: 16,
        timestamp: '2023-07-22T16:45:00Z',
    },
    {
        id: 8,
        type: 'image',
        media: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        caption: 'Delicious food!',
        likes: 195,
        comments: 12,
        timestamp: '2023-07-20T19:15:00Z',
    },
    {
        id: 9,
        type: 'image',
        media: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
        caption: 'Travel memories',
        likes: 276,
        comments: 21,
        timestamp: '2023-07-18T13:20:00Z',
    },
];

export default PostMeComponent;