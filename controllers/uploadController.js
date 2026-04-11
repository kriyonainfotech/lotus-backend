import { storage } from '../config/cloudinary.js';
import multer from 'multer';

// File Filter (Optional if you already filter in Cloudinary storage but good for consistency)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WEBP are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

/**
 * Endpoint to handle single file upload
 * Returns the public URL of the uploaded image
 */
export const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Cloudinary returns the URL in req.file.path or req.file.secure_url
    const fileUrl = req.file.path;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully to Cloudinary',
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

