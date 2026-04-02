const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

messageSchema.index({ conversation: 1, createdAt: 1 })
messageSchema.index({ conversation: 1, isRead: 1, sender: 1 })

const Message = mongoose.model("Message", messageSchema)

module.exports = Message
