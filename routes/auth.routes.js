const express = require("express")
const { register, login, logout } = require("../controllers/auth.controller.js")
const {isLogin} = require("../middleware/auth.middleware.js")

const router = express.Router()

router.post('/register', register)

router.post('/login',login)

router.post('/logout',isLogin ,logout)

module.exports = router