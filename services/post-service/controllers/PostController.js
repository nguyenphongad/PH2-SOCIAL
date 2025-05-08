
const PostModel = require('../models/PostModel');
const UserModel = require('../models/UserModel');
const LikeModel = require('../models/LikeModel');
const CommentsModel = require('../models/CommentsModel');
const mongoose = require("mongoose");
const { validationResult } = require('express-validator');


// Tạo bài đăng
const createPost = async (req, res) => {

     try {

          const { content, imageUrl } = req.body;

          // Lấy userId từ token đã đăng nhập
          const luserID = req.user.userID;
          const username = req.user.username;
          console.log("id người đăng bài: ", luserID)
          const existingUser = await UserModel.findOne({ luserID });

          if (existingUser) {
               return res.status(201).json({ message: 'người đăng bài không tồn tại', status: false });
          }

          // Tạo bài viết mới
          const newPost = new PostModel({
               userID: luserID,
               username: username,
               content,
               imageUrl

          });

          // Lưu bài viết vào database
          await newPost.save();

          return res.status(201).json({ message: "Đăng bài thành công", post: newPost });
     } catch (error) {
          console.error("Lỗi đăng bài:", error);
          return res.status(500).json({ message: "Lỗi server đăng bài" });
     }
};

// Lấy bài đăng theo PostId
const getPostByUsernameAndPostId = async (req, res) => {
     try {

          const { postId } = req.params;

          console.log("id bài đăng: ", postId)

          if (!mongoose.Types.ObjectId.isValid(postId)) {
               return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
          }

          const post = await PostModel.findOne({ _id: postId });
          if (!post) {
               return res.status(404).json({ message: 'Bài đăng không tồn tại' });
          }

          return res.status(200).json({ post });
     } catch (error) {
          console.error('Lỗi lấy bài đăng:', error);
          return res.status(500).json({ message: 'Lỗi server lấy bài đăng' });
     }
};

// Lấy bài đăng theo username (lấy tất cả bài đăng của username)
const getPostsByUser = async (req, res) => {
     try {
          const { username } = req.params; // Lấy username từ URL
          console.log("username để lấy bài đăng:", username);

          // Tìm user theo username
          const user = await UserModel.findOne({ username: username });
          if (!user) {
               return res.status(404).json({ message: 'Người dùng không tồn tại' });
          }

          // Tìm các bài đăng của người dùng
          const posts = await PostModel.find({ userID: user.userID }).sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo (mới nhất trước)

          return res.status(200).json({ posts });
     } catch (error) {
          console.error('Lỗi lấy bài đăng của người dùng:', error);
          return res.status(500).json({ message: 'Lỗi server lấy bài đăng của người dùng', error: error.message });
     }
};

//Update bài đăng
const updatePost = async (req, res) => {
     try {
          const { postId } = req.params;
          const { content, imageUrl, videoUrl } = req.body;
          const luserID = req.user.userID;

          console.log("postId để cập nhật:", postId);
          console.log("userId của người cập nhật:", luserID);

          if (!mongoose.Types.ObjectId.isValid(postId)) {
               return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
          }

          const post = await PostModel.findById(postId);
          if (!post) {
               return res.status(404).json({ message: 'Bài đăng không tồn tại' });
          }
          if (post.userID.toString() !== luserID) {
               return res.status(403).json({ message: 'Bạn không có quyền cập nhật bài đăng này!' })
          }

          const updateData = {};
          if (content !== undefined) {
               updateData.content = content;
          }
          if (imageUrl !== undefined) {
               updateData.imageUrl = imageUrl;
          }
          if (videoUrl !== undefined) {
               updateData.videoUrl = videoUrl;
          }
          if (req.body.content === undefined) {
               updateData.$unset = { ...updateData.$unset, content: 1 };
          }
          if (req.body.imageUrl === undefined) {
               updateData.$unset = { ...updateData.$unset, imageUrl: 1 };
          }
          if (req.body.videoUrl === undefined) {
               updateData.$unset = { ...updateData.$unset, videoUrl: 1 };
          }
          updateData.updatedAt = Date.now();

          const updatedPost = await PostModel.findByIdAndUpdate(
               postId,
               updateData,
               { new: true }
          );
          return res.status(200).json({ message: 'Cập nhật bài đăng thành công', post: updatedPost });

     } catch (error) {
          console.error('Lỗi cập nhật bài đăng:', error);
          return res.status(500).json({ message: 'Lỗi server update bài đăng', error: error.message });
     }
};

// delete bài đăng
const deletePost = async (req, res) => {
     try {
          const { postId } = req.params; // Lấy postId từ URL
          const luserID = req.user.userID; // Lấy userId từ token

          console.log("postId để xóa:", postId);
          console.log("userId của người xóa:", luserID);

          // Kiểm tra postId hợp lệ
          if (!mongoose.Types.ObjectId.isValid(postId)) {
               return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
          }

          // Tìm bài đăng để kiểm tra quyền
          const post = await PostModel.findById(postId);
          if (!post) {
               return res.status(404).json({ message: 'Bài đăng không tồn tại' });
          }

          // Kiểm tra quyền xóa
          if (post.userID.toString() !== luserID.toString()) {
               return res.status(403).json({ message: 'Bạn không có quyền xóa bài đăng này' });
          }

          // Xóa bài đăng
          await PostModel.findByIdAndDelete(postId);

          return res.status(200).json({ message: 'Xóa bài đăng thành công' });

     } catch (error) {
          console.error('Lỗi xóa bài đăng:', error);
          return res.status(500).json({ message: 'Lỗi server xóa bài đăng', error: error.message });
     }
};

// Lấy tất cả bài đăng từ các user đang theo dõi
const getFeedPosts = async (req, res) => {
     try {
         const currentUserId = req.user.userID; // Lấy ID người dùng hiện tại từ token
 
         // Lấy tham số phân trang từ query string (NẾU ĐÃ ÁP DỤNG Ở LẦN TRƯỚC)
         // Bạn có thể thêm logic này nếu muốn phân trang cho feed
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 10;
         const skip = (page - 1) * limit;
 
         // Tìm người dùng hiện tại (vẫn cần để lấy danh sách following từ UserModel cục bộ)
         // Query này dựa trên UserModel của post-service, cần đảm bảo dữ liệu 'following' ở đây là mới nhất
         // Lưu ý: UserModel của bạn tìm theo trường 'userID' (custom)
         const currentUser = await UserModel.findOne({ userID: new mongoose.Types.ObjectId(currentUserId) });
 
         if (!currentUser) {
             // Lưu ý: Nếu dùng populate, có thể không cần query currentUser ở đây nữa nếu
             // danh sách following được lấy từ nguồn khác (vd: gọi sang social-service)
             // Nhưng theo code hiện tại, chúng ta vẫn cần nó.
             return res.status(404).json({ message: 'Người dùng không tồn tại' });
         }
 
         // Lấy danh sách ID những người mà người dùng hiện tại đang theo dõi
         // Giả định currentUser.following chứa các ObjectId hoặc chuỗi ObjectId hợp lệ
         let followingObjectIds = [];
         if (currentUser.following && Array.isArray(currentUser.following)) {
             followingObjectIds = currentUser.following
                 .map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null)
                 .filter(id => id !== null);
         }
         // Thêm ID của người dùng hiện tại vào danh sách để xem bài của chính mình
         if (mongoose.Types.ObjectId.isValid(currentUserId)) {
              // Chú ý: currentUserId từ token có thể là giá trị của trường 'userID' custom,
              // trong khi PostModel.userID lưu _id. Cần đảm bảo chúng ta query PostModel bằng _id.
              // Nếu currentUserId là giá trị của trường 'userID' custom, chúng ta cần lấy _id tương ứng
              // từ currentUser đã tìm được.
              followingObjectIds.push(currentUser._id); // Thêm _id của currentUser
         } else {
              // Xử lý nếu currentUserId không hợp lệ (dù middleware đã kiểm tra token)
              console.warn("currentUserId không hợp lệ:", currentUserId);
         }
 
 
         // Lọc ra các ID duy nhất (phòng trường hợp user follow chính mình)
         followingObjectIds = [...new Set(followingObjectIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));
 
         if (followingObjectIds.length === 0) {
              return res.status(200).json({ feedPosts: [], currentPage: page, totalPages: 0, totalPosts: 0 });
         }
 
 
         // Lấy tổng số bài đăng phù hợp (cho phân trang)
         // Query PostModel bằng trường userID (lưu _id của user)
         const totalPosts = await PostModel.countDocuments({ userID: { $in: followingObjectIds } });
         const totalPages = Math.ceil(totalPosts / limit);
 
         // Lấy các bài đăng từ những người dùng trong danh sách followingObjectIds
         const feedPosts = await PostModel.find({ userID: { $in: followingObjectIds } })
             .sort({ createdAt: -1 }) // Sắp xếp mới nhất lên đầu
             .skip(skip)               // Bỏ qua các bài đăng của trang trước
             .limit(limit)             // Giới hạn số lượng bài đăng
             // --- DÒNG QUAN TRỌNG ĐỂ LẤY THÔNG TIN USER ---
             // Populate trường 'userID' (trong PostModel) bằng cách tham chiếu đến model 'Users'
             // và chỉ lấy các trường 'username' và 'profilePicture'.
             .populate({
                 path: 'userID', // Trường trong PostModel để populate
                 model: 'Users', // Tên model tham chiếu (Đã sửa từ 'User' thành 'Users')
                 select: 'username profilePicture' // Các trường muốn lấy
             });
             // ---------------------------------------------
 
         return res.status(200).json({
             feedPosts, // Giờ đây mỗi post trong mảng này sẽ có trường userID là object { _id, username, profilePicture }
             currentPage: page,
             totalPages,
             totalPosts
         });
 
     } catch (error) {
         console.error('Lỗi lấy feed bài đăng:', error);
         // Thêm chi tiết lỗi nếu có thể
         if (error.name === 'CastError') {
              return res.status(400).json({ message: 'ID người dùng không hợp lệ trong danh sách following.', error: error.message });
         }
         // Kiểm tra lỗi MissingSchemaError
         if (error.name === 'MissingSchemaError') {
              console.error("Lỗi Populate: Model chưa được đăng ký hoặc tên model sai.", error.message);
              return res.status(500).json({ message: 'Lỗi server: Cấu hình model tham chiếu bị lỗi.', error: error.message });
         }
         return res.status(500).json({ message: 'Lỗi server lấy feed bài đăng', error: error.message });
     }
 };

// Tìm kiếm bài đăng
const searchPosts = async (req, res) => {
     try {
          const { keyword } = req.query; // Lấy từ khóa từ query parameter
          console.log("Từ khóa tìm kiếm:", keyword);

          if (!keyword) {
               return res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm' });
          }

          // Tạo regex để tìm kiếm không phân biệt hoa thường và có thể tìm kiếm một phần của từ
          const regex = new RegExp(keyword, 'i');

          // Tìm kiếm các bài đăng có nội dung chứa từ khóa
          const searchPosts = await PostModel.find({ content: { $regex: regex } })
               .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo (mới nhất trước)

          return res.status(200).json({ searchPosts });

     } catch (error) {
          console.error('Lỗi tìm kiếm bài đăng:', error);
          return res.status(500).json({ message: 'Lỗi server tìm kiếm bài đăng', error: error.message });
     }
};

// like bài đăng
const toggleLikePost = async (req, res) => {
     try {
         const { postId } = req.params;
         const userId = req.user.userID;
 
         if (!mongoose.Types.ObjectId.isValid(postId)) {
             return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
         }
 
         // Kiểm tra xem người dùng đã thích bài đăng này chưa
         const existingLike = await LikeModel.findOne({ postId: postId, userId: userId });
 
         if (existingLike) {
             // Nếu đã thích, thì bỏ thích
             await LikeModel.findOneAndDelete({ postId: postId, userId: userId });
             await PostModel.findByIdAndUpdate(postId, { $pull: { likes: existingLike._id } });
             return res.status(200).json({ message: 'Đã bỏ thích bài đăng' });
         } else {
             // Nếu chưa thích, thì thích
             const newLike = new LikeModel({ postId: postId, userId: userId });
             await newLike.save();
             await PostModel.findByIdAndUpdate(postId, { $push: { likes: newLike._id } });
             return res.status(201).json({ message: 'Đã thích bài đăng' });
         }
 
     } catch (error) {
         console.error('Lỗi xử lý like bài đăng:', error);
         return res.status(500).json({ message: 'Lỗi server xử lý like bài đăng', error: error.message });
     }
 };

// Thêm bình luận
const addComment = async (req, res) => {
     try {
         const { postId } = req.params;
         const { content } = req.body;
         const userId = req.user.userID;
         const username = req.user.username; // Lấy username từ req.user
 
         if (!mongoose.Types.ObjectId.isValid(postId)) {
             return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
         }
 
         if (!content || content.trim() === '') {
             return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
         }
 
         const newComment = new CommentsModel({ postId: postId, userId: userId, username: username, content: content.trim() });
         await newComment.save();
 
         // (Tùy chọn) Cập nhật mảng comments trong PostModel
         await PostModel.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
 
         return res.status(201).json({ message: 'Đã bình luận', comment: newComment });
 
     } catch (error) {
         console.error('Lỗi thêm bình luận:', error);
         return res.status(500).json({ message: 'Lỗi server thêm bình luận', error: error.message });
     }
 };
 
//  Get  danh sách bình luận
const getComments = async (req, res) => {
     try {
         const { postId } = req.params;
 
         if (!mongoose.Types.ObjectId.isValid(postId)) {
             return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
         }
 
         const comments = await CommentsModel.find({ postId: postId })
             .sort({ createdAt: 1 }); // Sắp xếp theo thời gian tạo (cũ nhất trước)
             // .populate('userId', 'username profilePicture'); // (Tùy chọn) Lấy thông tin người dùng
 
         return res.status(200).json({ comments });
 
     } catch (error) {
         console.error('Lỗi lấy bình luận:', error);
         return res.status(500).json({ message: 'Lỗi server lấy bình luận', error: error.message });
     }
 };

module.exports = { createPost, getPostByUsernameAndPostId, deletePost, updatePost, getPostsByUser, getFeedPosts, searchPosts, toggleLikePost, addComment, getComments };
