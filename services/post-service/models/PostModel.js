const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        content: {
            type: String,
        },
        imageUrls: {
            type: [String],
            default: [],
        },
        videoUrl: {
            type: String,
            default: ""
        },
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Like",
            default: [],
        },
        comments: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Comment",
            default: [],
        },

    }
    , {
        timestamps: true,
        versionKey: false,
    });

const PostModel = mongoose.model('Posts', postSchema);

module.exports = PostModel;