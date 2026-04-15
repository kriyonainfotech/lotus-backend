import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  image: { type: String, required: true },
  fit: { type: String, default: 'contain' },
  type: { type: String }, // e.g., 'background'
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number },
  height: { type: Number },
  scale: { type: Number, default: 1 },
  angle: { type: Number, default: 0 },
  opacity: { type: Number, default: 1 },
  zIndex: { type: Number, default: 0 },
  isBackground: { type: Boolean, default: false }
});

const TextLayerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  font: { type: String, default: 'Inter' },
  size: { type: Number, default: 20 },
  sizeRatio: { type: Number },
  color: { type: String, default: '#000000' },
  x: { type: Number, default: 0.5 },
  y: { type: Number, default: 0.5 },
  width: { type: Number },
  height: { type: Number },
  angle: { type: Number, default: 0 },
  opacity: { type: Number, default: 1 },
  zIndex: { type: Number, default: 0 },
  bold: { type: Boolean, default: false },
  italic: { type: Boolean, default: false },
  alignment: { type: String, default: 'left' },
  textAlign: { type: String, default: 'left' },
  letterSpacing: { type: Number, default: 0 },
  lineHeight: { type: Number, default: 1.16 },
  uppercase: { type: Boolean, default: false },
  strokeColor: { type: String, default: '#000000' },
  strokeWidth: { type: Number, default: 0 }
});

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, default: 'General' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isHeroSection: { type: Boolean, default: false },
  scheduledDate: { type: Date },
  imageUrl: { type: String }, // Preview image URL
  baseColor: { type: String, default: '#FFFFFF' },
  defaultText: { type: String },
  size: { type: String, enum: ['POST', 'STORY', 'BANNER', 'CUSTOM'], default: 'POST' },
  ratio: { type: String, default: '1:1' },
  platform: { type: String, default: 'IG' },
  images: [ImageSchema],
  title: TextLayerSchema,
  subtitle: TextLayerSchema,
  textLayers: [TextLayerSchema], // Additional text layers
  fabricJSON: { type: Object }, // Raw Fabric.js JSON for re-editing
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Template = mongoose.model('Template', templateSchema);

export default Template;
