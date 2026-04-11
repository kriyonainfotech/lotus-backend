import { cloudinary } from '../config/cloudinary.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function testUpload() {
  try {
    console.log('Testing Cloudinary upload...');
    
    // We'll use a public image URL for testing or just check the config
    console.log('Cloudinary Config:', cloudinary.config().cloud_name);
    
    // Upload a sample image (using a public URL)
    const result = await cloudinary.uploader.upload('https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg', {
      folder: 'test_uploads',
    });

    
    console.log('Upload successful!');
    console.log('Public ID:', result.public_id);
    console.log('URL:', result.secure_url);
    
  } catch (error) {
    console.error('Upload failed!');
    console.error(error);
  }
}

testUpload();
