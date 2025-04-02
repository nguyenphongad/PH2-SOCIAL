// controllers/chatController.js
const Conversation = require('../models/ConversationModel');
const Message = require('../models/MessageModel');
const User = require('../models/UserModel');

const mongoose = require("mongoose")

const getChatPartners = async (req, res) => {
    try {
        const currentUserId = req.user.userID; // Lấy từ middleware


        // 1. Tìm tất cả cuộc trò chuyện và tin nhắn gần nhất
        const conversations = await Conversation.aggregate([
            {
                $match: {
                    participants: new mongoose.Types.ObjectId(currentUserId) // Chuyển đổi nếu cần
                }
            },
            {
                $lookup: {
                    from: 'messages', // Join với collection messages
                    let: { convId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$conversationId', '$$convId'] } // Tin nhắn thuộc cuộc hội thoại
                            }
                        },
                        { $sort: { createdAt: -1 } }, // Sắp xếp tin nhắn mới nhất đầu tiên
                        { $limit: 1 } // Chỉ lấy 1 tin nhắn gần nhất
                    ],
                    as: 'lastMessage'
                }
            },
            { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } } // Giữ lại cả cuộc hội thoại không có tin nhắn
        ]);
        // console.log("----")
        // console.log(conversations)

        // 2. Lấy danh sách partnerIds (loại bỏ currentUserId)
        const partnerIds = conversations.flatMap(conv =>
            conv.participants.filter(id => id.toString() !== currentUserId)
        );
        // console.log("----")
        // console.log(partnerIds)


        // 3. Lấy thông tin chi tiết partners (kèm lastMessage)
        const partners = await User.aggregate([
            {
                $match: { userID: { $in: partnerIds } }
            },
            {
                $project: {
                    _id: 0,
                    userID: 1,
                    username: 1,
                    name: 1,
                    profilePicture: 1
                }
            }
        ]);
        // console.log("----")
        // console.log(partners)

        // 4. Gắn lastMessage vào từng partner
        const result = partners.map(partner => {
            const formattedConversations = conversations.reduce((acc, conv) => {
                if (conv.lastMessage) {
                    acc["messages"] = {
                        conversationID:conv._id,
                        participants: conv.participants,
                        lastMessage: {
                            content: conv.lastMessage.message,
                            time: conv.lastMessage.createdAt,
                            isMeChat: conv.lastMessage.senderId.toString() === currentUserId
                        },
                    }

                } else {
                    acc["messages"] = {
                        lastMessage: null,
                        participants: conv.participants
                    };
                }
                return acc;
            }, {});

            return {
                ...partner,
                formattedConversations
            };
        });

        // 5. Sắp xếp theo thời gian tin nhắn gần nhất (mới nhất đầu tiên)
        result.sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });

        res.status(200).json({ partners: result });

        
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người nhắn tin:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

module.exports = { getChatPartners };