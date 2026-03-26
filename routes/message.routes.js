const express = require("express")
const { isLogin } = require("../middleware/auth.middleware.js")
const { sendMessage, getMessages } = require("../controllers/message.controller.js")


const router = express.Router()

router.post("/", isLogin, sendMessage)
router.get("/:conversationId", isLogin, getMessages)


module.exports = router 