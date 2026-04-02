const express = require("express")
const { register, login, logout } = require("../controllers/auth.controller.js")
const {isLogin} = require("../middleware/auth.middleware.js")
const { createRateLimiter } = require("../middleware/rateLimit.middleware.js")

const router = express.Router()
const authRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 20 })

router.post('/register', authRateLimit, register)

router.post('/login', authRateLimit, login)

router.post('/logout',isLogin ,logout)

module.exports = router
