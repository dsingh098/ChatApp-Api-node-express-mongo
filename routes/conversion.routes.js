const express = require("express")

const { createConversation, getConversations } = require("../controllers/conversation.controller.js")
const { isLogin } = require("../middleware/auth.middleware.js")

const router = express.Router()

router.post('/', isLogin, createConversation)

router.get('/', isLogin, getConversations)

module.exports= router