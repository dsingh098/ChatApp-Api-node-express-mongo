const onlineUsers = new Map() //
//  userId → socketId
const jwt = require("jsonwebtoken")
const Conversation = require("../models/conversion.model")

const getTokenFromCookieHeader = (cookieHeader) => {
    if (!cookieHeader || typeof cookieHeader !== "string") return null

    // Very small cookie parser for "token=...; other=..."
    const parts = cookieHeader.split(";")
    for (const part of parts) {
        const [rawName, ...rest] = part.trim().split("=")
        if (!rawName) continue
        const name = rawName.trim()
        const value = rest.join("=").trim()
        if (name === "token" && value) return decodeURIComponent(value)
    }

    return null
}

const socketHandler = (io) => {
    io.use((socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                getTokenFromCookieHeader(socket.handshake.headers?.cookie)

            if (!token) {
                return next(new Error("Unauthorized"))
            }

            const user = jwt.verify(token, process.env.JWT_SECRET)
            socket.user = user
            next()
        } catch (error) {
            next(new Error("Unauthorized"))
        }
    })

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id)

        // User online hua
        socket.on("userOnline", () => {
            onlineUsers.set(socket.user.id, socket.id)
            io.emit("onlineUsers", Array.from(onlineUsers.keys()))
            console.log("Online users:", Array.from(onlineUsers.keys()))
        })

        // Room join karo
        socket.on("joinRoom", async (conversationId) => {
            const isParticipant = await Conversation.exists({
                _id: conversationId,
                participants: socket.user.id
            })

            if (!isParticipant) {
                return socket.emit("socketError", "Access denied")
            }

            socket.join(conversationId)
            console.log(`User joined room: ${conversationId}`)
        })

        // Message bhejo
        socket.on("sendMessage", async (message) => {
            if (!message?.conversation) {
                return socket.emit("socketError", "Conversation is required")
            }

            const isParticipant = await Conversation.exists({
                _id: message.conversation,
                participants: socket.user.id
            })

            if (!isParticipant) {
                return socket.emit("socketError", "Access denied")
            }

            io.to(message.conversation).emit("receiveMessage", {
                ...message,
                sender: socket.user.id
            })
        })

        // Disconnect
        socket.on("disconnect", () => {
            // Online list se hatao
            onlineUsers.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId)
                }
            })
            io.emit("onlineUsers", Array.from(onlineUsers.keys()))
            console.log("User disconnected:", socket.id)
        })
    })
}

module.exports = socketHandler
