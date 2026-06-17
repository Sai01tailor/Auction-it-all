const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['USER','ADMIN','SELLER'],
        default:'USER'
    },
    otp:String,
    otpExpiresAt:Date,
    isVerified:{
        type:Boolean,
        default:false
    },
    // KYC fields
    kycStatus:{
        type:String,
        enum:['Unverified','Pending','Verified','Failed'],
        default:'Unverified',
        index:true
    },
    kycVerifiedAt:Date,
    kycFailureReason:String,
    kycLastAttemptAt:Date
});

// hadshing of password before saving 
userSchema.pre('save',async function(){
    if(!this.isModified('password')) return;
    this.password=await bcrypt.hash(this.password,10);
});

// compare given one and hashed one 
userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

module.exports=mongoose.model('User',userSchema);

