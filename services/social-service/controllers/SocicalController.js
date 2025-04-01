const UserModel = require("../model/UserModel");
const mongoose = require("mongoose")

const followUser = async (req, res) => {
    try {

        const { id: usernameToFollow } = req.params;
        const userID = req.user.userID;

        // Không thể follow chính mình
        const currentUser = await UserModel.findOne({ userID: new mongoose.Types.ObjectId(userID) });
        if (!currentUser) {
            return res.status(404).json({
                type: "follow",
                status: false,
                message: "người dùng hiện tại không tồn tại !",
            });
        }

        const userToFollow = await UserModel.findOne({ username: usernameToFollow });

        if (!userToFollow) {
            return res.status(404).json({
                type: "follow",
                status: false,
                message: " Không tìm thấy người cần follow!"
            })
        }

        // Lấy ObjectId của user cần follow
        const userToFollowId = userToFollow.userID.toString();


        if (userID === userToFollowId) {
            return res.status(400).json({
                type: "follow",
                status: false,
                message: "Không được follow chính mình !",
                follower: currentUser._id,
                follow_user: userToFollowId
            })
        }

        // Kiểm tra nếu đã follow rồi
        if (currentUser.following.includes(userToFollowId)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollowId);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== userID);

            await currentUser.save();
            await userToFollow.save();

            return res.status(200).json({
                type: "unfollow",
                status: true,
                message: "Bỏ follow thành công!",
                follower: currentUser._id,
                follow_user: userToFollowId,
            });
        }


        currentUser.following.push(userToFollowId);
        userToFollow.followers.push(userID);

        const addFL = await currentUser.save();
        const addFLing = await userToFollow.save();


        if (addFL && addFLing) {
            return res.status(200).json({
                type: "follow",
                status: true,
                message: "Follow thành công",
                follower: currentUser.userID,
                follow_user: userToFollowId
            })
        }

        return res.status(500).json({
            type: "follow",
            status: false,
            message: "Lỗi ngoại lệ!"
        })

    } catch (error) {
        return res.status(500).json({
            type: "follow",
            status: false,
            message: "Loi server : " + error
        })
    }
}

// kiem tra trang thai following
const checkFollowStatus = async (req, res) => {
    try {
        const { id: usernameToCheck } = req.params;
        const userID = req.user.userID;


        const currentUser = await UserModel.findOne({ userID: new mongoose.Types.ObjectId(userID) });
        if (!currentUser) {
            return res.status(404).json({
                type: "checkFollowStatus",
                status: false,
                message: "Người dùng hiện tại không tồn tại !",
            });
        }

        const userToCheck = await UserModel.findOne({ username: usernameToCheck });
        if (!userToCheck) {
            return res.status(404).json({
                type: "checkFollowStatus",
                status: false,
                message: "Không tìm thấy người cần kiểm tra trạng thái follow!"
            });
        }

        const isFollowing = currentUser.following.includes(userToCheck.userID.toString());

        return res.status(200).json({
            type: "checkFollowStatus",
            message: "Đã follow người này",
            status: true,
            isFollowing: isFollowing,
        });

    } catch (error) {
        return res.status(500).json({
            type: "checkFollowStatus",
            message: "Chưa follow người này",
            status: false,
            message: "Lỗi server: " + error
        });
    }
};







module.exports = {
    followUser,
    checkFollowStatus
}