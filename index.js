const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http')
const { Server } = require('socket.io')
const socketHandler = require('./socket/socketHandler')
dotenv.config();
const cookieParser = require('cookie-parser')

const authRoutes = require("./routes/auth.routes")
const conversationRoute = require("./routes/conversion.routes")
const messageRoutes = require("./routes/message.routes")

const app = express();
const port = process.env.PORT || 5000;

// HTTP server 
const server = http.createServer(app)

// Socket.io 
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    }
})

// Socket handler
socketHandler(io)

app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/user", authRoutes)
app.use("/api/conversation", conversationRoute)
app.use("/api/message", messageRoutes)

// DB + Server start
const startServer = async () => {
    try {
        if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
            throw new Error("MONGO_URI and JWT_SECRET must be set")
        }

        await connectDB()
        server.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`)
        process.exit(1)
    }
}

startServer()
