const Message = require("../models/message.model.js")
const Conversation = require("../models/conversion.model.js")
const mongoose = require("mongoose")

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value)

// Send Message
const sendMessage = async (req, res) => {
    try {
        const { content, conversation } = req.body

        if (!content || !conversation) {
            return res.status(400).json({
                message: "Fill all Required fields"
            })
        }

        if (!isValidObjectId(conversation)) {
            return res.status(400).json({
                message: "Invalid conversation id"
            })
        }

        const conversationDoc = await Conversation.findOne({
            _id: conversation,
            participants: req.user.id
        })

        if (!conversationDoc) {
            return res.status(403).json({
                message: "Access denied"
            })
        }

        const message = await Message.create({
            sender: req.user.id,
            content: content.trim(),
            conversation,
        })

        await Conversation.findByIdAndUpdate(conversation, {
            lastMessage: message._id
        })

        return res.status(201).json(message)

    } catch (error) {
        console.error("Send message error:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// Get Messages
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params

        if (!conversationId || !isValidObjectId(conversationId)) {
            return res.status(400).json({
                message: "Valid conversationId is required"
            })
        }

        const isParticipant = await Conversation.exists({
            _id: conversationId,
            participants: req.user.id
        })

        if (!isParticipant) {
            return res.status(403).json({
                message: "Access denied"
            })
        }

        const messages = await Message.find({ conversation: conversationId })
            .populate("sender", "name username email")
            .sort({ createdAt: 1 })

        return res.status(200).json(messages)

    } catch (error) {
        console.error("Get messages error:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const getUnreadCount = async (req, res) => {
    try {
        const { conversationId } = req.params

        if (!conversationId || !isValidObjectId(conversationId)) {
            return res.status(400).json({
                message: "Valid conversationId is required"
            })
        }

        const isParticipant = await Conversation.exists({
            _id: conversationId,
            participants: req.user.id
        })

        if (!isParticipant) {
            return res.status(403).json({
                message: "Access denied"
            })
        }

        const count = await Message.countDocuments({
            conversation: conversationId,
            isRead: false,
            sender: { $ne: req.user.id } 
        })

        return res.status(200).json({ unreadCount: count })

    } catch (error) {
        console.error("Get unread count error:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params

        if (!conversationId || !isValidObjectId(conversationId)) {
            return res.status(400).json({
                message: "Valid conversationId is required"
            })
        }

        const isParticipant = await Conversation.exists({
            _id: conversationId,
            participants: req.user.id
        })

        if (!isParticipant) {
            return res.status(403).json({
                message: "Access denied"
            })
        }

        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: req.user.id },
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        )

        return res.status(200).json({
            message: "Messages marked as read"
        })
    } catch (error) {
        console.error("Mark read error:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

module.exports = { sendMessage, getMessages, getUnreadCount, markMessagesAsRead }
