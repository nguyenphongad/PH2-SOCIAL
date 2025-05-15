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
        state.status = "loading";
      })
      .addCase(getPostDetail.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.currentPost = payload;
      })
      .addCase(getPostDetail.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
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
      .addCase(toggleLike.pending, (state) => {
        state.likeStatus = "loading";
      })
      .addCase(toggleLike.fulfilled, (state, { payload }) => {
        state.likeStatus = "succeeded";
        
        // Cần phải cập nhật lại danh sách likes trong bài đăng
        // Vì backend trả về message thành công, không trả về bài viết đã cập nhật
        // Chỉ thay đổi trạng thái UI, sẽ cập nhật chính xác khi refresh
        
        // Cập nhật trong danh sách items
        const post = state.items.find(post => post._id === payload.postId);
        if (post) {
          // Nếu message là "Đã thích bài đăng" thì tăng count
          if (payload.message === "Đã thích bài đăng") {
            post.likes = [...(post.likes || []), "temp-like-id"];
          } else {
            // Nếu message là "Đã bỏ thích bài đăng" thì giảm count
            post.likes = (post.likes || []).slice(0, -1);
          }
        }
        
        // Cập nhật trong current post nếu đang xem chi tiết
        if (state.currentPost && state.currentPost._id === payload.postId) {
          if (payload.message === "Đã thích bài đăng") {
            state.currentPost.likes = [...(state.currentPost.likes || []), "temp-like-id"];
          } else {
            state.currentPost.likes = (state.currentPost.likes || []).slice(0, -1);
          }
        }
      })
      .addCase(toggleLike.rejected, (state, { payload }) => {
        state.likeStatus = "failed";
        state.error = payload;
      })

      // ADD COMMENT - Thêm bình luận vào bài đăng
      .addCase(addComment.pending, (state) => {
        state.commentStatus = "loading";
      })
      .addCase(addComment.fulfilled, (state, { payload }) => {
        state.commentStatus = "succeeded";
        
        // Thêm comment vào danh sách comments
        const postId = payload.comment.postId;
        if (!state.comments[postId]) {
          state.comments[postId] = [];
        }
        state.comments[postId] = [...state.comments[postId], payload.comment];
        
        // Cập nhật số lượng comment trong danh sách items
        const post = state.items.find(post => post._id === postId);
        if (post) {
          if (!post.comments) post.comments = [];
          post.comments.push(payload.comment._id);
        }
        
        // Cập nhật số lượng comment trong current post
        if (state.currentPost && state.currentPost._id === postId) {
          if (!state.currentPost.comments) state.currentPost.comments = [];
          state.currentPost.comments.push(payload.comment._id);
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
export const { resetPostState, resetSearchResults, resetActionStatus } = postsSlice.actions;

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
