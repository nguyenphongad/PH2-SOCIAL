const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        profilePicture: {
            type: String,
            default: "https://tinhdaunhuy.com/wp-content/uploads/2015/08/default-avatar.jpg",
        },
        bio: {
            type: String,
            default: "",
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        followers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Users",
            default: [],
        },
        following: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Users",
            default: [],
        },
        posts: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Posts",
            default: [],
        },
        bookmarks: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Posts",
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        blockedUsers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Users",
            default: [],
        },
    },
    { timestamps: true } 
);

const UserModel = mongoose.model("Users", UserSchema);

module.exports = UserModel;
