const UserModel = require("../model/UserModel");
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;

const getProfileByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        // console.log("ctlus " + username);

        if (!username) {
            return res.status(400).json({ message: "Username không hợp lệ" });
        }

        // Tìm user theo username
        const user = await UserModel.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại", isNotFoud: true });
        }

        // Kiểm tra nếu có user đăng nhập
        const isMe = req.user && req.user.userID === user.userID.toString();

        if (!isMe) {
            const userProfile = user.toObject();

            // delete userProfile.userID;
            delete userProfile._id;
            delete userProfile.blockedUsers;
            delete userProfile.createdAt;
            delete userProfile.updatedAt;
            delete userProfile.phoneNumber;
            delete userProfile.isAdmin;

            return res.status(200).json({ ...userProfile, isMe });
        }

        return res.status(200).json({ ...user.toObject(), isMe });

    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ" });
    }
};


// Search user by username or name
const searchUser = async (req, res) => {
    try {
        // http:s.com/search?text=fff
        const searchText = req.query.text?.trim();

        if (!searchText) {
            return res.status(200).json({
                message: "Vui lòng nhập từ khóa tìm kiếm",
                users: [],
                isEmpty: true
            });
        }

        const users = await UserModel.find({
            $or: [
                { username: { $regex: searchText, $options: 'i' } },
                { name: { $regex: searchText, $options: 'i' } }
            ]
        })
            .select('username name profilePicture')
            .limit(20);

        if (!users || users.length === 0) {
            return res.status(200).json({
                message: "Người dùng không tồn tại",
                users: [],
                isEmpty: true
            });
        }

        const formattedUsers = users.map(user => ({
            username: user.username,
            name: user.name,
            profilePicture: user.profilePicture || "default_avatar_url"
        }));

        return res.status(200).json({
            message: "Tìm kiếm thành công",
            users: formattedUsers,
            isEmpty: false
        });

    } catch (error) {
        return res.status(500).json({
            message: "Lỗi máy chủ"
        });
    }
};

// get danh sach following user

const getUsersInfoFollower = async (req, res) => {
    try {

        const  userIDs  = req.body;

        if (!Array.isArray(userIDs)) {
            return res.status(400).json({
                type: "get list follower user",
                status: false,
                message: "Đầu ra không phải danh sách follower"
            })
        }
        const objectIds = userIDs.map(id => new ObjectId(id));

        const users = await UserModel.find(
            { userID: { $in: objectIds } }, 
            { username: 1, profilePicture: 1, name: 1 }
        ).lean();


        if (!users) {
            return res.status(404).json({
                type: "get list follower user",
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        res.status(200).json({
            type: "get list follower user",
            success: true,
            data: users
        });



    } catch (error) {
        console.error("Lỗi khi lấy thông tin người theo dõi:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin người theo dõi"
        });
    }
}

// get danh sách người đang theo dõi (following)
const getUsersInfoFollowing = async (req, res) => {
    try {
        const userIDs = req.body;

        if (!Array.isArray(userIDs)) {
            return res.status(400).json({
                type: "get list following user",
                status: false,
                message: "Đầu vào không phải danh sách following"
            })
        }
        
        const objectIds = userIDs.map(id => new ObjectId(id));

        const users = await UserModel.find(
            { userID: { $in: objectIds } }, 
            { username: 1, profilePicture: 1, name: 1 }
        ).lean();

        if (!users) {
            return res.status(404).json({
                type: "get list following user",
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        res.status(200).json({
            type: "get list following user",
            success: true,
            data: users
        });

    } catch (error) {
        console.error("Lỗi khi lấy thông tin người đang theo dõi:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin người đang theo dõi"
        });
    }
}

module.exports = { 
    getProfileByUsername, 
    searchUser, 
    getUsersInfoFollower,
    getUsersInfoFollowing   // Thêm hàm mới vào export
};
