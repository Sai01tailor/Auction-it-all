const mongoose=require('mongoose');

const itemSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
    },
    startingPrice:{
        type:Number,
        required:true,
        min:1,
    },
    currentHighestBid:{
        type:Number,
        default:0
    },
    // we store an array of Cloudinary Secure URLS here
    photos:[{
        type:String
    }],
    // The uSer who listed it give it a sellerId
    sellerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    // If auction has winner
    winnerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null
    },

    status:{
        type:String,
        enum:['DRAFT','ACTIVE','SOLD','CANCELLED'],
        default:'ACTIVE'
    },
    // Bidding startTime and endTime
    startTime:{
        type:Date,
        default:Date.now
    },
    endTime:{
        type:Date,
        required:true
    },
    auctionType:{
        type: String,
        enum: ['ENGLISH', 'DUTCH', 'BLIND'],
        default: 'ENGLISH'
    }
},{
    timeStamps:true //Autmomatically tracks createdAt and updatedat
});

module.exports=mongoose.model('Item',itemSchema);

// NOTES:
// The winnerId field: This starts as null. 
// When the auction timer hits zero, your server will lock the item, change the status to SOLD, 
// and stamp the highest bidder's ID right here.

// The status enum: When someone browses the homepage,
//  your controller will strictly search for Item.find({ status: "ACTIVE" }). 
// This prevents people from accidentally bidding on canceled or sold items.