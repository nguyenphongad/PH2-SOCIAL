const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        videoUrl: {
            type: String,
            default: ""
        },
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Tyms",
            default: [],
        },
        comments: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Comments",
            default: [],
        },

    }
    , {
        timestamps: true,
        versionKey: false,
    });

const PostModel = mongoose.model('Posts', postSchema);

module.exports = PostModel;