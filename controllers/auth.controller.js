const User = require("../models/user.model")
const jwt = require('jsonwebtoken')
const generateToken = require("../config/token.js")
const bcrypt = require('bcryptjs')

const register =  async (req, res) => {
 try {
    const {name, email, password, username} = req.body

    if(!username || !email || !password) {
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
    name: name,
    username: username,
    email: email,
    password: hashedpassword
})
    const token = generateToken(user)

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(201).json({
        message:"User registered successfully",
        user: { id: user._id, name: user.name, email: user.email, username: user.username},
        token
    })
    
 } catch (error) {
    return res.status(500).json({
        message:"Internal Server Error",
        error:error.message
    })
 }
}