const UserModel = require('../model/UserModel');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const checkUser = await UserModel.findOne({ username: username })

        if (checkUser) {
            const vad = await bcrypt.compare(password, checkUser.password);

            if (!vad) {
                res.status(201).json({ message: "Password không chính xác!", status: false });
                return;
            } else {
                const token = jwt.sign(
                    { username: checkUser.username, id: checkUser._id },
                    process.env.JWTKEY,
                    { expiresIn: "1h" }
                );
                res.status(200).json({ message: "Đăng nhập thành công",checkUser, status: true, token });
            }
        } else {
            res.status(201).json({ message: "Username không tồn tại!", status: false });
        }

    } catch (error) {
        console.log("lỗi")
        res.status(500).json(error);
    }

}


const registerUser = async (req, res) => {
    try {
        const { username, name, password, phoneNumber, email, isAdmin, profilePicture, bio, gender } = req.body;
        const existingUser = await UserModel.findOne({
            $or: [{ username }, { phoneNumber }, { email }]
        });

        if (existingUser) {
            return res.status(201).json({ message: 'Tên người dùng, số điện thoại hoặc email đã được đăng ký' });
        }

        const hashPassword = await bcrypt.hash(password, 10); // Lặp 10 lần băm

        const user = new UserModel({
            username,
            name,
            password: hashPassword,
            phoneNumber,
            email,
            isAdmin: isAdmin || false,
            profilePicture: profilePicture || "https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg",
            bio: bio || "",
            gender: gender || "male",
            followers: [],
            following: [],
            posts: [],
            bookmarks: [],
            isActive: true,
            blockedUsers: []
        });
        await user.save();
        res.status(201).json({
            message: 'Đăng ký thành công',
            user: {
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                createdAt: user.createdAt, 
            }
        });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau' });
    }
};


module.exports = { loginUser, registerUser }