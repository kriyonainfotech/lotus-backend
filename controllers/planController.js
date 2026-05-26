import PricingPlan from '../models/PricingPlan.js';

/** GET /api/plans — admin: all plans */
export const getAllPlans = async (req, res) => {
  try {
    const plans = await PricingPlan.find().sort({ sortOrder: 1, createdAt: 1 });
    return res.status(200).json(plans);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

/** POST /api/plans */
export const createPlan = async (req, res) => {
  try {
    const { name, description, price, durationDays, badge, features, isActive, sortOrder } = req.body;

    if (!name || price == null || !durationDays) {
      return res.status(400).json({ message: 'name, price, and durationDays are required' });
    }

    const plan = await PricingPlan.create({
      name,
      description: description || '',
      price: Number(price),
      durationDays: Number(durationDays),
      badge: badge || '',
      features: Array.isArray(features) ? features : [],
      isActive: isActive !== false,
      sortOrder: sortOrder ?? 0,
    });

    return res.status(201).json(plan);
  } catch (error) {
    return res.status(400).json({ message: 'Error creating plan', error: error.message });
  }
};

/** PUT /api/plans/:id */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.price != null) updates.price = Number(updates.price);
    if (updates.durationDays != null) updates.durationDays = Number(updates.durationDays);
    if (updates.sortOrder != null) updates.sortOrder = Number(updates.sortOrder);

    const plan = await PricingPlan.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.status(200).json(plan);
  } catch (error) {
    return res.status(400).json({ message: 'Error updating plan', error: error.message });
  }
};

/** DELETE /api/plans/:id — permanent delete */
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PricingPlan.findByIdAndDelete(id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
};
