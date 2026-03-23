const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("Db connected successfully")
    } catch (error) {
        console.log(`Db connection Error: ${error.message}`);
    }
}

module.exports = connectDB;