const ENDPOINT = {
    // ====== AUTH SERVICE ENDPOINTS ======
    CHECK_TOKEN : "/checkToken",         // GET - Kiểm tra token hợp lệ
    LOGIN_USER : "/login",               // POST - Đăng nhập người dùng

    // ====== USER SERVICE ENDPOINTS ======
    GET_USER_PROFILE: "",                // GET - Lấy thông tin profile người dùng
    SHOW_LIST_FOLLOWER_USER: "/getUsersInfoFollower", // POST - Lấy danh sách người theo dõi

    // ====== SOCIAL SERVICE ENDPOINTS ======
    FOLLOW_USER: "/follow",              // POST - Theo dõi/hủy theo dõi người dùng
    CHECK_FOLLOW_STATUS: "/checkFollowStatus", // GET - Kiểm tra trạng thái follow

    // ====== CHAT SERVICE ENDPOINTS ======
    SHOW_LIST_MESSAGE : "/list-message", // GET - Lấy danh sách tin nhắn
    SHOW_LIST_BOX_MESSAGE : "",          // GET - Lấy danh sách hộp thoại

    // ====== POST SERVICE ENDPOINTS ======
    // Quản lý bài đăng
    CREATE_POST: "/create",              // POST - Tạo bài đăng mới
    GET_POST_DETAIL: "/id",              // GET - Lấy chi tiết bài đăng theo ID (/id/:postId)
    GET_USER_POSTS: "/user",             // GET - Lấy tất cả bài đăng của người dùng (/user/:username)
    UPDATE_POST: "",                     // PUT - Cập nhật bài đăng (/:postId)
    DELETE_POST: "",                     // DELETE - Xóa bài đăng (/:postId)
    GET_FEED_POSTS: "/feed",             // GET - Lấy feed bài đăng từ người theo dõi
    SEARCH_POSTS: "/search",             // GET - Tìm kiếm bài đăng
    
    // Tương tác với bài đăng
    LIKE_POST: "/likes",                 // POST - Like/unlike bài đăng (/:postId/likes)
    ADD_COMMENT: "/comments",            // POST - Thêm bình luận (/:postId/comments)
    GET_COMMENTS: "/comments"            // GET - Lấy danh sách bình luận (/:postId/comments)
}

export default ENDPOINT
