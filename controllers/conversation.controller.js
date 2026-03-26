const Conversation = require("../models/conversion.model")

const createConversation = async (req, res) => {
    try {
        const { isGroup, participants, groupName } = req.body

        // private chat
        if (!isGroup) {
            const existing = await Conversation.findOne({
                isGroup: false,
                participants: { $all: [req.user.id, participants[0]] }
            })
                // check id already exist
            if (existing) {
                return res.status(200).json(existing)
            }

            const conversation = await Conversation.create({
                isGroup: false,
                participants: [req.user.id, participants[0]]
            })

            return res.status(201).json(conversation)
        }

        const conversation = await Conversation.create({
            isGroup: true,
            groupName,
            participants: [...participants, req.user.id],
            admin: req.user.id
        }) 

        return res.status(201).json(conversation)

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user.id] }
        })
        .populate("participants", "name username email")
        .populate("lastMessage")
        .sort({ updatedAt: -1 })

        return res.status(200).json(conversations)

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

module.exports = { createConversation, getConversations }      