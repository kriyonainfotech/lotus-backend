import Template from '../models/Template.js';
import { cloudinary } from '../config/cloudinary.js';

// Helper to upload base64 thumbnail to Cloudinary
const uploadThumbnail = async (base64Data, templateId) => {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'lotus/thumbnails',
      public_id: `template_${templateId || Date.now()}`,
      overwrite: true,
      invalidate: true
    });
    return result.secure_url;
  } catch (error) {
    console.error('Thumbnail Upload Error:', error);
    return null;
  }
};

// Create a new template
export const createTemplate = async (req, res) => {
  try {
    const { thumbnail, ...templateData } = req.body;
    let template = new Template(templateData);
    
    if (thumbnail) {
      const imageUrl = await uploadThumbnail(thumbnail, template._id);
      if (imageUrl) template.imageUrl = imageUrl;
    }

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error('Create Template Error:', error);
    res.status(500).json({ message: 'Error creating template', error: error.message });
  }
};

// Get all templates with filtering and pagination
export const getTemplates = async (req, res) => {
  try {
    const { category, hero, date, type, q, platform, ratio, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {};

    if (type) query.type = type;
    if (category) query.categoryId = category;
    if (platform) query.platform = platform;
    if (ratio) query.ratio = ratio;
    if (hero === 'true') query.isHeroSection = true;

    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }

    if (date && date !== 'all' && date !== 'scheduled') {
      // Use $expr to compare only the date part (YYYY-MM-DD) to avoid timezone issues
      query.$expr = {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } },
          date
        ]
      };
    } else if (date === 'scheduled') {
      query.scheduledDate = { $exists: true, $ne: null };
    }

    const templates = await Template.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const totalCount = await Template.countDocuments(query);
    
    // To maintain compatibility with older clients that expect a direct array,
    // we can check a header or just always return the new format. 
    // Given we are updating both, new format is better.
    res.json({
      templates,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalTemplates: totalCount,
      hasMore: skip + templates.length < totalCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error: error.message });
  }
};

// Get a single template
export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching template', error: error.message });
  }
};

// Update a template
export const updateTemplate = async (req, res) => {
  try {
    const { thumbnail, ...templateData } = req.body;
    
    if (thumbnail) {
      const imageUrl = await uploadThumbnail(thumbnail, req.params.id);
      if (imageUrl) templateData.imageUrl = imageUrl;
    }

    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { ...templateData, updatedAt: Date.now() },
      { new: true }
    );
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Update Template Error:', error);
    res.status(500).json({ message: 'Error updating template', error: error.message });
  }
};

// Delete a template
export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting template', error: error.message });
  }
};
