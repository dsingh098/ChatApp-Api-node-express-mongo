const Conversation = require("../models/conversion.model")
const User = require("../models/user.model")
const mongoose = require("mongoose")

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value)

const createConversation = async (req, res) => {
    try {
        const { isGroup, participants = [], groupName } = req.body

        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({
                message: "Participants are required"
            })
        }

        const normalizedParticipants = [...new Set(participants)]

        if (normalizedParticipants.some((participantId) => !isValidObjectId(participantId))) {
            return res.status(400).json({
                message: "One or more participant ids are invalid"
            })
        }

        if (normalizedParticipants.includes(req.user.id)) {
            return res.status(400).json({
                message: "Do not include yourself in participants"
            })
        }

        const existingUsers = await User.countDocuments({
            _id: { $in: normalizedParticipants }
        })

        if (existingUsers !== normalizedParticipants.length) {
            return res.status(400).json({
                message: "One or more participants do not exist"
            })
        }

        // private chat
        if (!isGroup) {
            if (normalizedParticipants.length !== 1) {
                return res.status(400).json({
                    message: "Private conversation must contain exactly one other participant"
                })
            }

            const existing = await Conversation.findOne({
                isGroup: false,
                participants: { $all: [req.user.id, normalizedParticipants[0]] },
                $expr: { $eq: [{ $size: "$participants" }, 2] }
            })
                // check id already exist
            if (existing) {
                return res.status(200).json(existing)
            }

            const conversation = await Conversation.create({
                isGroup: false,
                participants: [req.user.id, normalizedParticipants[0]]
            })

            return res.status(201).json(conversation)
        }

        // group 
        if (!groupName || !groupName.trim()) {
            return res.status(400).json({
                message: "Group name is required"
            })
        }

        if (normalizedParticipants.length < 2) {
            return res.status(400).json({
                message: "Group conversation requires at least two other participants"
            })
        }

        const conversation = await Conversation.create({
            isGroup: true,
            groupName: groupName.trim(),
            participants: [...normalizedParticipants, req.user.id],
            admin: req.user.id
        }) 

        return res.status(201).json(conversation)

    } catch (error) {
        console.error("Create conversation error:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
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
        console.error("Get conversations error:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const addMember = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.body

        if (!id || !userId || !isValidObjectId(id) || !isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Valid conversation ID and user ID are required"
            })
        }

        const conversation = await Conversation.findById(id)

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            })
        }

        // Group check
        if (!conversation.isGroup) {
            return res.status(400).json({
                message: "Cannot add members to a private conversation"
            })
        }

        // Admin check — sirf admin add kar sakta hai
        if (conversation.admin.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only group admin can add members"
            })
        }

        //Is Already member 
        if (conversation.participants.some((participantId) => participantId.toString() === userId)) {
            return res.status(400).json({
                message: "User is already a member of this group"
            })
        }

        const userExists = await User.exists({ _id: userId })

        if (!userExists) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const updated = await Conversation.findByIdAndUpdate(
            id,
            { $push: { participants: userId } },
            { new: true }
        ).populate("participants", "name username email")

        return res.status(200).json({
            message: "Member added successfully",
            conversation: updated
        })

    } catch (error) {
        console.error("Add member error:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const removeMember = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.body

        if (!id || !userId || !isValidObjectId(id) || !isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Valid conversation ID and user ID are required"
            })
        }

        const conversation = await Conversation.findById(id)

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            })
        }

        // Group check
        if (!conversation.isGroup) {
            return res.status(400).json({
                message: "Cannot remove members from a private conversation"
            })
        }

        // Admin check
        if (conversation.admin.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only group admin can remove members"
            })
        }

        // Member hai bhi ya nahi?
        if (!conversation.participants.some((participantId) => participantId.toString() === userId)) {
            return res.status(400).json({
                message: "User is not a member of this group"
            })
        }

        // Admin khud ko remove nahi kar sakta
        if (conversation.admin.toString() === userId) {
            return res.status(400).json({
                message: "Group admin cannot be removed"
            })
        }

        const updated = await Conversation.findByIdAndUpdate(
            id,
            { $pull: { participants: userId } },
            { new: true }
        ).populate("participants", "name username email")

        return res.status(200).json({
            message: "Member removed successfully",
            conversation: updated
        })

    } catch (error) {
        console.error("Remove member error:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

module.exports = { createConversation, getConversations, addMember, removeMember } 
