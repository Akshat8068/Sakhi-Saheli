import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: 'dl77ftllk',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploaderToCloudinary = async (fileLink) => {
    try {
        // Upload an image
        const uploadResult = await cloudinary.uploader.upload(fileLink, {
            resource_type: "auto"
        });



        return uploadResult;

    } catch (error) {

        // Delete file even if upload fails
        if (fs.existsSync(fileLink)) {
            fs.unlinkSync(fileLink);
        }

        throw error; // Re-throw to handle in controller
    }
};

export default uploaderToCloudinary;