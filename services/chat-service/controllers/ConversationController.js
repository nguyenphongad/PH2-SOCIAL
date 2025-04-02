const ConversationModel = require("../models/ConversationModel");


const createConversation = async (req, res) => {
    try {
        const { participants } = req.body;
        const newConversation = new ConversationModel({ participants, messages: [] });
        await newConversation.save();
        res.status(201).json(newConversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserConversations = async (req, res) => {
    try {
        const conversations = await ConversationModel.find({ participants: req.params.userId });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createConversation, getUserConversations }