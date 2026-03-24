const User = require("../models/user.model")
const jwt = require('jsonwebtoken')
const generateToken = require("../config/token.js")
const bcrypt = require('bcryptjs')


// function/controller for user registration

const register =  async (req, res) => {
 try {
    const {name, email, password, username} = req.body

    if(!username || !email || !password) {
        return res.status(400).json({
            message:"All fields are required"
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
        user: { id: user._id, 
            name: user.name, email: 
            user.email, username: 
            user.username},
        token
    })
    
 } catch (error) {
    return res.status(500).json({
        message:"Internal Server Error",
        error:error.message
    })
 }
}

// function/controller for user login

const login = async (req, res) => {
    try {
        const {email,password} = req.body

        if(!email ||!password) {
            return res.status(400).json({
                message:"All fields are required"
            })
        }

        const existUser = await User.findOne({email})

        if(!existUser) {
            return res.status(400).json({
                message:"Invalid credentials"})
        }

        const isPasswordValid = await bcrypt.compare(password, existUser.password)

        if(!isPasswordValid) {
            return res.status(400).json({
                message:"Invalid credentials"
            })
        }

        const token = generateToken(existUser)

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message:"Login successful",
            user: { id: existUser._id, name: existUser.name, email: existUser.email, username: existUser.username},
            token
        })
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error",
            error:error.message
        })
    }
}

const logout = async (req, res) => {
    res.clearCookie("token")
    return res.status(200).json({
        message:"Logout successful"
    })
}


module.exports = {
    register,
    login,
    logout
}