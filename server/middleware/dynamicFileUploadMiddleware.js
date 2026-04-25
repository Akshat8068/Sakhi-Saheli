// multerConfig.js
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `product-${crypto.randomUUID()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Generate fields
const fields = [];
const MAX_COLORS = 20;

for (let i = 0; i < MAX_COLORS; i++) {
    fields.push({ name: `mainImage_${i}`, maxCount: 1 });
    fields.push({ name: `images_${i}`, maxCount: 20 });
}

// ✅ Export the middleware directly
export const productUploadFields = upload.fields(fields);

// Also export as default
export default productUploadFields;