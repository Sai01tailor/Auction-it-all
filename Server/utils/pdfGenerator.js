
const puppeteer = require('puppeteer-core');
const ejs = require('ejs');
const path = require('path');

/**
 * Generates a PDF buffer from an EJS template and dynamic data.
 * @param {Object} data - The dynamic data to inject (transaction details, etc.)
 * @returns {Promise<Buffer>} - The binary PDF data
 */
const generateInvoicePDF = async (data) => {
    let browser = null;
    
    try {
        // 1. Point to the exact location of your EJS template
        const templatePath = path.join(__dirname, '../templates/invoice.ejs');

        // 2. Render the EJS file into a raw HTML string, injecting the data
        const htmlContent = await ejs.renderFile(templatePath, data);

        // 3. Launch Puppeteer
        // Note: executablePath must point to your local Chrome/Edge installation 
        // since we are using puppeteer-core to save space.
        browser = await puppeteer.launch({ 
            headless: 'new',
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });

        const page = await browser.newPage();

        // 4. Load the compiled HTML string into the headless browser
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // 5. Take the PDF snapshot
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Crucial: Ensures CSS colors and watermarks render
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        return pdfBuffer; 

    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw new Error("Failed to generate PDF document");
    } finally {
        // 6. ALWAYS close the browser to prevent massive memory leaks
        if (browser) {
            await browser.close();
        }
    }
};

/**
 * Generates a Receipt PDF for wallet top-up transactions
 * @param {Object} data - Receipt data (payment details, coins added, etc.)
 * @returns {Promise<Buffer>} - The binary PDF data
 */
const generateReceiptPDF = async (data) => {
    let browser = null;
    
    try {
        // 1. Point to the receipt template
        const templatePath = path.join(__dirname, '../templates/receipt.ejs');

        // 2. Render the EJS file into HTML
        const htmlContent = await ejs.renderFile(templatePath, data);

        // 3. Launch Puppeteer
        browser = await puppeteer.launch({ 
            headless: 'new',
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });

        const page = await browser.newPage();

        // 4. Load the HTML
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // 5. Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        return pdfBuffer; 

    } catch (error) {
        console.error("Receipt PDF Generation Error:", error);
        throw new Error("Failed to generate receipt PDF");
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = { generateInvoicePDF, generateReceiptPDF };