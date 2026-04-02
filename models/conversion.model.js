const mongoose = require("mongoose")

const conversationSchema = new mongoose.Schema({
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }
}, { timestamps: true })

conversationSchema.index({ participants: 1, updatedAt: -1 })

const Conversation = mongoose.model("Conversation", conversationSchema)

module.exports = Conversation
