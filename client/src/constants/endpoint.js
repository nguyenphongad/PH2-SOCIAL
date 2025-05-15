const ENDPOINT = {
    CHECK_TOKEN : "/auth/checkToken",
    LOGIN_USER : "/auth/login",

    GET_USER_PROFILE: "/user",
    SHOW_LIST_FOLLOWER_USER: "/user/getUsersInfoFollower",

    FOLLOW_USER: "/social/follow",
    CHECK_FOLLOW_STATUS: "/social/checkFollowStatus",
    
    SHOW_LIST_MESSAGE : "/chat/list-message",
    SHOW_LIST_BOX_MESSAGE : "/chat",

    // POST endpoints
    CREATE_POST: "/post/create",                        // POST - Tạo bài đăng mới
    GET_POST_DETAIL: "/post/id",                          // GET - Lấy chi tiết bài đăng theo ID
    GET_USER_POSTS: "/post/user",                      // GET - Lấy tất cả bài đăng của người dùng
    UPDATE_POST: "/post",                              // PUT - Cập nhật bài đăng
    DELETE_POST: "/post",                              // DELETE - Xóa bài đăng
    GET_FEED_POSTS: "/post/feed",                      // GET - Lấy feed bài đăng từ người theo dõi
    SEARCH_POSTS: "/post/search",                      // GET - Tìm kiếm bài đăng
    
    // POST interaction endpoints
    LIKE_POST: "/post/like",                           // POST - Like/unlike bài đăng
    ADD_COMMENT: "/post/comment",                      // POST - Thêm bình luận
    GET_COMMENTS: "/post/comments"                     // GET - Lấy danh sách bình luận
}

export default ENDPOINT
