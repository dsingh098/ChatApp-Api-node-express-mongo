const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


app.get('/', (req, res) => {
    res.send("the server is running")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    connectDB()
})