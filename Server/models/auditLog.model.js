const mongoose=require('mongoose')

const auditLogSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null
    },
    action:{
        type:String,
        required:true
    },
    ipAddress:{
        type:String,
        required:true
    },
    deviceInfo:{
        type:String,
    },
    endPoint:{
        type:String,
    }
},{
    timestamps:true
});

module.export=mongoose.model('AuditLog',auditLogSchema)


// // src/routes/bid.routes.js
// const express = require('express');
// const router = express.Router();
// const auditTracker = require('../middlewares/auditTracker.middleware');
// const bidController = require('../controllers/bid.controller');

// // Notice we pass exactly what action is happening
// router.post('/place-bid', auditTracker('BID_PLACED'), bidController.placeBid);

// module.exports = router;