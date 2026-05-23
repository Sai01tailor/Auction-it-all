const mongoose = require('mongoose');
const {connectRedis}=require('./config/redis');
const connectDB = async()=>{
    try{
       await mongoose.connect(process.env.MONGO_URI);
       console.log(`MongoDB connected successfully: [worker:${process.pid}]`);

        //Tell the worker to connect to redis immediately 
        await connectRedis();
    }catch(err){
        console.error(`MongoDB Connection Error/Redis [Worker: ${process.pid}]: ${err.message}`);
        console.log(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;