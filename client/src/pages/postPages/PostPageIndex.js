import React from 'react';
import { Navigate } from 'react-router-dom';

const PostPageIndex = () => {
    // Redirect to home page since we now use a modal for post creation
    return <Navigate to="/" />;
};

export default PostPageIndex;