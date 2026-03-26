const Message = require("../models/message.model.js")
const Conversation = require("../models/conversion.model.js")

// Send Message
const sendMessage = async (req, res) => {
    try {
        const { content, conversation } = req.body

        if (!content || !conversation) {
            return res.status(400).json({
                message: "Fill all Required fields"
            })
        }

        const message = await Message.create({
            sender: req.user.id,
            content,
            conversation,
        })

        await Conversation.findByIdAndUpdate(conversation, {
            lastMessage: message._id
        })

        return res.status(201).json(message)

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

// Get Messages
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params

        if (!conversationId) {
            return res.status(400).json({
                message: "ConversationId is Required"
            })
        }

        const messages = await Message.find({ conversation: conversationId })
            .populate("sender", "name username email")
            .sort({ createdAt: 1 })

        return res.status(200).json(messages)

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

module.exports = { sendMessage, getMessages }