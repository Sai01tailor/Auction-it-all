const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
       await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected successfully: [worker:${process.pid}]`);
    }catch(err){
        console.error(`MongoDB Connection Error [Worker: ${process.pid}]: ${err.message}`);
        console.log(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;