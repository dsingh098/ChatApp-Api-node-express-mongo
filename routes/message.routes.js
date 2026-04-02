const express = require("express")
const { isLogin } = require("../middleware/auth.middleware.js")
const { sendMessage, getMessages, getUnreadCount, markMessagesAsRead } = require("../controllers/message.controller.js")


const router = express.Router()

router.post("/", isLogin, sendMessage)
router.patch("/read/:conversationId", isLogin, markMessagesAsRead)
router.get("/unread/:conversationId", isLogin, getUnreadCount)
router.get("/:conversationId", isLogin, getMessages)


module.exports = router 
