import { createSlice } from "@reduxjs/toolkit";
import { 
  loadFeed,
  createPost,
  getUserPosts, 
  getPostDetail, 
  updatePost, 
  deletePost, 
  toggleLike, 
  addComment, 
  getComments,
  searchPosts 
} from "../thunks/postThunk";

const postsSlice = createSlice({
  name: "posts",
  
  initialState: {
    // Bài đăng hiện tại (news feed hoặc bài đăng của user cụ thể)
    items: [],
    // Chi tiết một bài đăng cụ thể
    currentPost: null,
    // Kết quả tìm kiếm bài đăng
    searchResults: [],
    // Bình luận của bài đăng hiện tại
    comments: {},
    // Trạng thái chung
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    // Trạng thái riêng cho từng thao tác
    createStatus: "idle",
    updateStatus: "idle",
    deleteStatus: "idle",
    likeStatus: "idle",
    commentStatus: "idle",
    // Thông báo lỗi
    error: null
  },

  reducers: {
    // Reset trạng thái khi chuyển trang hoặc component unmount
    resetPostState: (state) => {
      state.currentPost = null;
      state.status = "idle";
      state.error = null;
    },

    // Reset trạng thái tìm kiếm
    resetSearchResults: (state) => {
      state.searchResults = [];
    },

    // Reset trạng thái thao tác
    resetActionStatus: (state) => {
      state.createStatus = "idle";
      state.updateStatus = "idle";
      state.deleteStatus = "idle";
      state.likeStatus = "idle";
      state.commentStatus = "idle";
    },

    // Thêm reducer để xóa currentPost khi cần
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.status = "idle";
    }
  },

  extraReducers: (builder) => {
    builder
      // LOAD FEED - Lấy danh sách bài đăng cho news feed
      .addCase(loadFeed.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadFeed.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.items = payload;
      })
      .addCase(loadFeed.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      })

      // CREATE POST - Tạo bài đăng mới
      .addCase(createPost.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createPost.fulfilled, (state, { payload }) => {
        state.createStatus = "succeeded";
        // Thêm bài đăng mới vào đầu danh sách
        state.items = [payload.post, ...state.items];
      })
      .addCase(createPost.rejected, (state, { payload }) => {
        state.createStatus = "failed";
        state.error = payload;
      })

      // GET USER POSTS - Lấy tất cả bài đăng của một người dùng
      .addCase(getUserPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUserPosts.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.items = payload;
      })
      .addCase(getUserPosts.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      })

      // GET POST DETAIL - Lấy chi tiết một bài đăng
      .addCase(getPostDetail.pending, (state) => {
        // Chỉ set trạng thái loading nếu không có currentPost
        if (!state.currentPost) {
          state.status = "loading";
        }
      })
      .addCase(getPostDetail.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        // Chỉ cập nhật currentPost nếu payload hợp lệ
        if (payload && payload._id) {
          state.currentPost = payload;
        }
      })
      .addCase(getPostDetail.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
        state.currentPost = null;
      })

      // UPDATE POST - Cập nhật bài đăng
      .addCase(updatePost.pending, (state) => {
        state.updateStatus = "loading";
      })
      .addCase(updatePost.fulfilled, (state, { payload }) => {
        state.updateStatus = "succeeded";
        
        // Cập nhật bài đăng trong danh sách
        state.items = state.items.map(post => 
          post._id === payload._id ? payload : post
        );
        
        // Cập nhật chi tiết bài đăng hiện tại nếu đang xem
        if (state.currentPost && state.currentPost._id === payload._id) {
          state.currentPost = payload;
        }
      })
      .addCase(updatePost.rejected, (state, { payload }) => {
        state.updateStatus = "failed";
        state.error = payload;
      })

      // DELETE POST - Xóa bài đăng
      .addCase(deletePost.pending, (state) => {
        state.deleteStatus = "loading";
      })
      .addCase(deletePost.fulfilled, (state, { payload }) => {
        state.deleteStatus = "succeeded";
        // Xóa bài đăng khỏi danh sách
        state.items = state.items.filter(post => post._id !== payload.postId);
        // Reset current post nếu đang xem bài đó
        if (state.currentPost && state.currentPost._id === payload.postId) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, { payload }) => {
        state.deleteStatus = "failed";
        state.error = payload;
      })

      // TOGGLE LIKE POST - Like/Unlike bài đăng
      .addCase(toggleLike.pending, (state, action) => {
        state.likeStatus = "loading";
        
        // Optimistic UI update - Cập nhật UI ngay lập tức trước khi API hoàn thành
        const postId = action.meta.arg; // Lấy postId từ tham số của action
        
        // Cập nhật trong danh sách items
        const postIndex = state.items.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          const post = state.items[postIndex];
          // Đảo ngược trạng thái like
          const currentLikeStatus = post.isLikedByCurrentUser || false;
          post.isLikedByCurrentUser = !currentLikeStatus;
          
          if (post.isLikedByCurrentUser) {
            // Nếu like thì tăng số like
            if (!post.likes) post.likes = [];
            post.likes.push('temp-like-id');
          } else {
            // Nếu unlike thì giảm số like
            if (post.likes && post.likes.length > 0) {
              post.likes.pop();
            }
          }
        }
        
        // Cập nhật trong current post nếu đang xem chi tiết
        if (state.currentPost && state.currentPost._id === postId) {
          const currentLikeStatus = state.currentPost.isLikedByCurrentUser || false;
          state.currentPost.isLikedByCurrentUser = !currentLikeStatus;
          
          if (state.currentPost.isLikedByCurrentUser) {
            if (!state.currentPost.likes) state.currentPost.likes = [];
            state.currentPost.likes.push('temp-like-id');
          } else {
            if (state.currentPost.likes && state.currentPost.likes.length > 0) {
              state.currentPost.likes.pop();
            }
          }
        }
      })
      .addCase(toggleLike.fulfilled, (state, { payload }) => {
        state.likeStatus = "succeeded";
        
        // Lưu ý: Backend trả về message thành công, không trả về bài viết đã cập nhật
        // Chúng ta đã cập nhật UI tạm thời ở trên (optimistic update)
        // Không cần làm gì thêm ngoài việc đánh dấu trạng thái đã hoàn thành
      })
      .addCase(toggleLike.rejected, (state, { payload, meta }) => {
        state.likeStatus = "failed";
        state.error = payload;
        
        // Rollback khi có lỗi - khôi phục trạng thái ban đầu
        const postId = meta.arg;
        
        // Rollback trong danh sách items
        const postIndex = state.items.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          const post = state.items[postIndex];
          // Đảo ngược trạng thái like để khôi phục
          post.isLikedByCurrentUser = !post.isLikedByCurrentUser;
          
          if (post.isLikedByCurrentUser) {
            // Nếu trạng thái hiện tại là like, tức là trước đó unlike bị lỗi, thêm lại like
            if (!post.likes) post.likes = [];
            post.likes.push('temp-like-id');
          } else {
            // Nếu trạng thái hiện tại là unlike, tức là trước đó like bị lỗi, bỏ like
            if (post.likes && post.likes.length > 0) {
              post.likes.pop();
            }
          }
        }
        
        // Rollback trong current post
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isLikedByCurrentUser = !state.currentPost.isLikedByCurrentUser;
          
          if (state.currentPost.isLikedByCurrentUser) {
            if (!state.currentPost.likes) state.currentPost.likes = [];
            state.currentPost.likes.push('temp-like-id');
          } else {
            if (state.currentPost.likes && state.currentPost.likes.length > 0) {
              state.currentPost.likes.pop();
            }
          }
        }
      })

      // ADD COMMENT - Thêm bình luận vào bài đăng
      .addCase(addComment.pending, (state) => {
        state.commentStatus = "loading";
      })
      .addCase(addComment.fulfilled, (state, { payload }) => {
        state.commentStatus = "succeeded";
        
        // Đảm bảo có payload và comment
        if (payload && payload.comment) {
          const comment = payload.comment;
          const postId = comment.postId;
          
          // Thêm comment vào danh sách comments
          if (!state.comments[postId]) {
            state.comments[postId] = [];
          }
          
          // Kiểm tra xem comment đã tồn tại chưa để tránh trùng lặp
          const commentExists = state.comments[postId].some(c => c._id === comment._id);
          if (!commentExists) {
            state.comments[postId].push(comment);
          }
          
          // Cập nhật số lượng comment trong danh sách items
          const post = state.items.find(post => post._id === postId);
          if (post) {
            if (!post.comments) post.comments = [];
            
            // Kiểm tra trùng lặp trước khi thêm vào
            const commentExistsInPost = post.comments.some(c => c._id === comment._id);
            if (!commentExistsInPost) {
              post.comments.push(comment);
            }
          }
          
          // Cập nhật số lượng comment trong current post
          if (state.currentPost && state.currentPost._id === postId) {
            if (!state.currentPost.comments) state.currentPost.comments = [];
            
            // Kiểm tra trùng lặp trước khi thêm vào
            const commentExistsInCurrentPost = state.currentPost.comments.some(c => c._id === comment._id);
            if (!commentExistsInCurrentPost) {
              state.currentPost.comments.push(comment);
            }
          }
        }
      })
      .addCase(addComment.rejected, (state, { payload }) => {
        state.commentStatus = "failed";
        state.error = payload;
      })

      // GET COMMENTS - Lấy danh sách bình luận cho bài đăng
      .addCase(getComments.pending, (state) => {
        state.commentStatus = "loading";
      })
      .addCase(getComments.fulfilled, (state, { payload }) => {
        state.commentStatus = "succeeded";
        // Lưu danh sách comments theo postId
        state.comments[payload.postId] = payload.comments;
      })
      .addCase(getComments.rejected, (state, { payload }) => {
        state.commentStatus = "failed";
        state.error = payload;
      })

      // SEARCH POSTS - Tìm kiếm bài đăng
      .addCase(searchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchPosts.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.searchResults = payload;
      })
      .addCase(searchPosts.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      });
  }
});

// Export actions
export const { resetPostState, resetSearchResults, resetActionStatus, clearCurrentPost } = postsSlice.actions;

// Export selectors
export const selectAllPosts = state => state.posts.items;
export const selectCurrentPost = state => state.posts.currentPost;
export const selectPostById = (state, postId) => 
  state.posts.items.find(post => post._id === postId);
export const selectPostComments = (state, postId) => 
  state.posts.comments[postId] || [];
export const selectSearchResults = state => state.posts.searchResults;
export const selectPostStatus = state => state.posts.status;
export const selectPostError = state => state.posts.error;

// Export reducer
export default postsSlice.reducer;
