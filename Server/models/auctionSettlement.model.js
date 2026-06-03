const mongoose=require('mongoose');

const auctionSettlementSchema=new mongoose.Schema({
    /// The unique ID printed on the Invoice PDF (e.g., "SETTLE-XYZ123")
    settlementId: {
        type: String,
        required: true,
        unique: true
    },
    // References to the entities involved
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    hammerPricePaise: {
        type: Number,
        required: true
    },
    securityDepositPaise: {
        type: Number,
        required: true // The 10% deducted from the wallet
    },
    offlineBalancePaise: {
        type: Number,
        required: true // The 90% they owe in person
    },

    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'DISPUTED'],
        default: 'COMPLETED'
    }
},{
    timestamps:true
})

// VIRTUALS: To easily format paise to Rupees for your PDF Generator
auctionSettlementSchema.virtual('hammerPriceRupees').get(function() {
    return (this.hammerPricePaise / 100).toFixed(2);
});

auctionSettlementSchema.virtual('securityDepositRupees').get(function() {
    return (this.securityDepositPaise / 100).toFixed(2);
});

auctionSettlementSchema.virtual('offlineBalanceRupees').get(function() {
    return (this.offlineBalancePaise / 100).toFixed(2);
});

// Ensure virtuals are included when converting the document to JSON/Objects
auctionSettlementSchema.set('toJSON', { virtuals: true });
auctionSettlementSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AuctionSettlement', auctionSettlementSchema);