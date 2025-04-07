// controllers/chatController.js
const Conversation = require('../models/ConversationModel');
const Message = require('../models/MessageModel');
const User = require('../models/UserModel');

const mongoose = require("mongoose")

const getChatPartners = async (req, res) => {
    try {
        const currentUserId = req.user.userID;
        console.log("Current User ID:", currentUserId);

        // 1. Lấy tất cả cuộc trò chuyện của user hiện tại
        const conversations = await Conversation.aggregate([
            {
                $match: {
                    participants: new mongoose.Types.ObjectId(currentUserId)
                }
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "messages",
                    foreignField: "_id",
                    as: "messages"
                }
            },
            {
                $addFields: {
                    sortedMessages: {
                        $sortArray: { input: "$messages", sortBy: { createdAt: -1 } }
                    }
                }
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$sortedMessages", 0] } // Lấy tin nhắn mới nhất
                }
            }
        ]);

        console.log("Conversations:", JSON.stringify(conversations, null, 2));

        // 2. Lấy danh sách đối tác
        const partnerIds = new Set();
        conversations.forEach(conv => {
            conv.participants.forEach(participant => {
                if (participant.toString() !== currentUserId) {
                    partnerIds.add(participant.toString());
                }
            });
        });

        // console.log("Partner IDs:", [...partnerIds]);

        // 3. Lấy thông tin users
        const partners = await User.find(
            { userID: { $in: [...partnerIds] } },
            {
                userID: 1,
                username: 1,
                name: 1,
                profilePicture: 1,
                name :1
            }
        );

        // console.log("Partners:", JSON.stringify(partners, null, 2));

        // 4. Gắn thông tin tin nhắn cuối vào từng partner
        const result = partners.map(partner => {
            const conversation = conversations.find(conv =>
                conv.participants.some(p => p.toString() === partner.userID.toString())
            );

            let formattedConversations = {};

            if (conversation && conversation.lastMessage) {
                formattedConversations = {
                    messages: {
                        conversationID: conversation._id,
                        participants: conversation.participants,
                        lastMessage: {
                            content: conversation.lastMessage.message,
                            time: conversation.lastMessage.createdAt,
                            isMeChat: conversation.lastMessage.senderId.toString() === currentUserId
                        }
                    }
                };
            }

            return {
                ...partner.toObject(),
                formattedConversations
            };
        });

        console.log("Final Result:", JSON.stringify(result, null, 2));

        res.status(200).json({ partners: result });

    } catch (error) {
        console.error("Lỗi khi lấy danh sách người nhắn tin:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
};


module.exports = { getChatPartners };