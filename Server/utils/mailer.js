const {Resend}=require('resend');
const resend=new Resend(process.env.RESEND_API_KEY);

// a generic utility
const sendEmail=async(to,subject,htmlContent)=>{
    try{
        const data=await resend.emails.send({
            from:'Auctions <onboarding@resend.dev>',
            to:to,
            subject:subject,
            html:htmlContent
        });
        return data;
    }catch(err){
        console.error('Email utility failed!:',error);
        return null;
    }
};

module.exports={sendEmail};
