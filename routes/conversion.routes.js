const express = require("express")

const { createConversation, getConversations, addMember, removeMember } = require("../controllers/conversation.controller.js")
const { isLogin } = require("../middleware/auth.middleware.js")

const router = express.Router()

router.post('/', isLogin, createConversation)

router.get('/', isLogin, getConversations)

router.post("/add/:id",isLogin, addMember)

router.delete("/remove/:id",isLogin ,removeMember)

module.exports= router