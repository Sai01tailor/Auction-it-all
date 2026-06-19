const mongoose=require('mongoose')

const walletSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true // Enforces strict 1-1 relation ship per user 
    },
    // money they can use for bidding 
    availableMoney:{
        type:Number,
        default:0,
        min:[0,"Available balance cannot be negative "]
    },
    // money that is frozen 
    frozenMoney:{
        type:Number,
        default:0,
        min:[0,'Frozen balance cannot be negative']
    },
    currency:{
        type:String,
        enum:['USD','INR','EUR'],
        default:'INR'
    },
    // to suspend fraud accounts 
    status:{
        type:String,
        enum:['ACTIVE','SUSPENDED'],
        default:'ACTIVE'
    }
},{
    timestamps:true
})

module.exports=mongoose.model('Wallet',walletSchema);