const User = require("../models/user.model")
const jwt = require('jsonwebtoken')
const generateToken = require("../config/token.js")
const bcrypt = require('bcryptjs')

const register =  async (req, res) => {
 try {
    const {name, email, password, name} = req.body

    if(!name || !email || !password) {
        return res.status(400).json({
            messsage:"All fields are required"
        })
    }

    const exitinguser = await User.findOne({email})

    if(exitinguser) {
        return res.status(400).json({
            message:"User already exists"
        })
    }

    const salt = 10

    const hashedpassword = await bcrypt.hash(password, salt)

    const user = await User.create({
        user: user.name,
        username: user.username,
        email: user.email,
        password: hashedpassword
    })

    
 } catch (error) {
    return res.status(500).json({
        message:"Internal Server Error",
        error:error.message
    })
 }
}