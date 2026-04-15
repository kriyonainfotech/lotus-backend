import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true); // Automatically load from CLOUDINARY_URL env var
} else {
  console.error('[BACKEND] CLOUDINARY_URL is missing in environment!');
}
console.log('[BACKEND] CLOUDINARY CONFIG INITIALIZED');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'admin_assets',
    allowed_formats: ['jpg', 'png', 'svg'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  },
});

const upload = multer({ storage: storage });

export const uploadToCloudinary = async (req, res) => {
  console.log('--- [ADMIN] UPLOAD REQUEST RECEIVED ---');
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log(`--- [ADMIN] UPLOADED TO CLOUDINARY: ${req.file.filename}`);

    res.json({
      url: req.file.path,
      public_id: req.file.filename,
      _id: req.file.filename // Use public_id as _id for frontend compatibility
    });
  } catch (error) {
    console.error('CLOUDINARY CONTROLLER UPLOAD ERROR:', error);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed: ' + error.message,
      error: error.stack
    });
  }
};

export const getMediaList = async (req, res) => {
  console.log('[BACKEND] GET MEDIA LIST REQUEST RECEIVED');
  try {
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'admin_assets', // Removed trailing slash for broader matching
      max_results: 100
    });

    console.log('[BACKEND] CLOUDINARY API RESULT:', {
      count: result.resources?.length,
      firstResource: result.resources?.[0]?.public_id
    });

    const resources = result.resources || [];
    
    // Map Cloudinary resources to the format expected by the frontend
    const media = resources.map(file => ({
      _id: file.public_id, // Use public_id as _id
      url: file.secure_url,
      publicId: file.public_id,
      createdAt: file.created_at
    }));

    console.log(`[BACKEND] FETCHED ${media.length} MEDIA ITEMS FROM CLOUDINARY`);
    res.json(media);
  } catch (error) {
    console.error('Cloudinary Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch media library', error: error.message });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    // Note: The 'id' here will be the public_id (e.g., admin_assets/filename)
    // If the folder is included, use it directly.
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'No media ID provided' });
    }

    console.log(`[BACKEND] DELETING FROM CLOUDINARY: ${id}`);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(id);

    if (result.result === 'not found') {
      return res.status(404).json({ message: 'Media not found on Cloudinary' });
    }

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Media Delete Error:', error);
    res.status(500).json({ message: 'Failed to delete media', error: error.message });
  }
};

export const syncMedia = async (req, res) => {
  res.status(410).json({ message: 'Sync is no longer needed. Media is now fetched directly from Cloudinary.' });
};

export const middleware = upload.single('image');
