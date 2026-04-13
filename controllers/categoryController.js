import Category from '../models/Category.js';
import Template from '../models/Template.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Create a category
export const createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    // Check if any templates are using this category
    const templatesCount = await Template.countDocuments({ categoryId: req.params.id });
    if (templatesCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category with assigned templates' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};
