const UserModel = require("../model/UserModel");

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
            return res.status(404).json({ message: "Người dùng không tồn tại" ,isNotFoud: true});
        }

        // Kiểm tra nếu có user đăng nhập
        const isMe = req.user && req.user.id === user._id.toString();

        if (!isMe) {
            const userProfile = user.toObject(); 

            delete userProfile.userID;
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



// const checkToken = async (req, res) => {
//     try {
//         const userId = req.user.id;   

//         // Tìm user theo id từ token
//         const user = await UserModel.findById(userId).select("-password");
//         if (!user) {
//             return res.status(404).json({ message: "Người dùng không tồn tại", isNotFoud: true });
//         }

//         return res.status(200).json({ ...user.toObject() });
//     } catch (error) {
//         console.error("Lỗi lấy thông tin người dùng:", error);
//         return res.status(500).json({ message: "Lỗi máy chủ" });
//     }
// };



module.exports = { getProfileByUsername };
