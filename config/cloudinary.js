import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// The user provided CLOUDINARY_URL=cloudinary://153431594282752:xdPyF9gJokBiwpAtGXE1uizhvME@defuvegs7
// We can let cloudinary handle it or parse it manually if it fails.
// Just calling config() without arguments often works if CLOUDINARY_URL is in process.env
cloudinary.config();

if (!cloudinary.config().api_key) {
    // Manual fallback if auto-config fails
    const url = process.env.CLOUDINARY_URL;
    if (url) {
        const matches = url.match(/cloudinary:\/\/(\d+):([\w-]+)@([\w-]+)/);
        if (matches) {
            cloudinary.config({
                api_key: matches[1],
                api_secret: matches[2],
                cloud_name: matches[3],
                secure: true
            });
        }
    }
}


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lotus_app',
    allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return file.fieldname + '-' + uniqueSuffix;
    },
  },
});

export { cloudinary, storage };
