const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
dotenv.config();
const cookieParser = require('cookie-parser')

const authRoutes = require("./routes/auth.routes.js")

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cookieParser())

// Routes
 app.use("/api/user", authRoutes)

//  coonstion of Db and server
connectDB()
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})