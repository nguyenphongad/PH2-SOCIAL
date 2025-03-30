const UserModel = require('../model/UserModel');
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Không được để trống!", status: false });
    }

    try {
        const checkUser = await UserModel.findOne({ username });
        if (!checkUser) {
            return res.status(404).json({ message: "Username không tồn tại!", status: false });
        }

        const isPasswordValid = await bcrypt.compare(password, checkUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Password không chính xác!", status: false });
        }
        const token = jwt.sign(
            { username: checkUser.username, userID: checkUser.userID },
            process.env.JWTKEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            user: { username: checkUser.username, userID: checkUser.userID },
            status: true,
            token
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại!", status: false });
    }
};



const registerUser = async (req, res) => {
    try {
        const { username, name, password, phoneNumber, email, profilePicture, bio, gender } = req.body;
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

const checkToken = async (req, res) => {
    try {
        // Lấy token từ header authorization
        const token = req.header("Authorization")?.split(" ")[1];
        // console.log(token)

        if (!token) {
            return res.status(401).json({ message: "Không có token, không được phép truy cập", isLogin: false });
        }

        // Giải mã token để lấy thông tin user
        const decoded = jwt.verify(token, process.env.JWTKEY);


        // Tìm người dùng theo id từ decoded token
        const user = await UserModel.findOne({ userID: new mongoose.Types.ObjectId(decoded.userID) });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại", isNotFound: true });
        }

        // console.log(res);
        // Trả về thông tin người dùng
        return res.status(200).json({ user, isLogin: true });


    } catch (error) {
        console.error("Lỗi xác thực token:", error.message);
        return res.status(401).json({ message: "Token không hợp lệ", isLogin: false });
    }
};



module.exports = { loginUser, registerUser, checkToken }