import multerStorageCloudinary from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// Handle both named and default exports depending on package version
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder:"kisantrust/diagnoses",
        allowed_formats:["jpg","jpeg","png"],
    },
});

const upload = multer({storage});

export default upload;