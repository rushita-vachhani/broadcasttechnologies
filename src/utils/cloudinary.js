import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  cloud_api_key: process.env.CLOUDINARY_API_KEY, 
  cloud_api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) {
            return null;
        }

        //upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'}); // this will automatically detect the file type (image, video, etc.)

            //file has been uploaded successfully
            console.log('File uploaded to Cloudinary:', response, "response url = ", response.url);
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath); // delete the local file if upload fails
            return null;
        }
};

export { uploadOnCloudinary };
