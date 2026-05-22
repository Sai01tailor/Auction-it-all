const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

async function testInvoice() {
    try {
        const data = {
            transactionId: "TXN-987654321",
            date: "May 22, 2026",
            buyerName: "Preet Kotak",
            buyerId: "UID-10293",
            sellerName: "Krish",
            sellerId: "UID-88392",
            itemName: "Sony PlayStation 5 Pro",
            hammerPrice: "45,000",
            securityDeposit: "4,500",
            offlineBalance: "40,500"
        };

        const templatePath = path.join(__dirname, 'templates/invoice.ejs');
        const htmlContent = await ejs.renderFile(templatePath, data);

        const outPath = path.join(__dirname, 'preview_invoice.html');
        fs.writeFileSync(outPath, htmlContent);
        
        console.log("✅ Success! Generated preview HTML at:");
        console.log(outPath);
    } catch (err) {
        console.error("Failed to generate HTML:", err);
    }
}

testInvoice();
