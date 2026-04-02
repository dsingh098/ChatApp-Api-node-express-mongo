const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Db connected successfully")
    } catch (error) {
        console.error(`Db connection Error: ${error.message}`);
        throw error;
    }
}

module.exports = connectDB;
