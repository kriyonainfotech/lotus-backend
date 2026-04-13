import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lotus_templates',
    allowed_formats: ['jpg', 'png', 'svg'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  },
});

const upload = multer({ storage: storage });

export const uploadToCloudinary = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    res.json({
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

export const middleware = upload.single('image');
