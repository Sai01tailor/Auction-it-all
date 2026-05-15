const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
        // upload on cloudinary

        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })

        // file has been uploaded succesfully 
        console.log("File is uploaded on Cloudinary",response.url);

        // Delete localfile after success
        fs.unlinkSync(localFilePath)
        return response;
    }catch(err){
        console.error("Cloudinary Error:",err);

        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath);
        }

        throw err;
    }
};

const deleteFromCloudinary=async(publicId)=>{
    try{
        await cloudinary.uploader.destroy(publicId)
    }
    catch(err){
        console.error('Cloudiary Delete Failed',err)
    }
}

module.exports={uploadOnCloudinary,deleteFromCloudinary}