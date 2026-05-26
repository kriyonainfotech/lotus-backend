import Subscription from '../models/Subscription.js';

/**
 * Returns the user's active subscription, or null.
 * Marks expired rows as `expired` when endDate has passed.
 */
export const getActiveSubscription = async (userId) => {
  const now = new Date();

  await Subscription.updateMany(
    { userId, status: 'active', endDate: { $lt: now } },
    { $set: { status: 'expired' } },
  );

  return Subscription.findOne({
    userId,
    status: 'active',
    endDate: { $gte: now },
  })
    .sort({ endDate: -1 })
    .populate('planId', 'name price durationDays')
    .lean();
};

export const computeSubscriptionEndDate = (durationDays, existingActive) => {
  const now = new Date();
  let base = now;

  if (existingActive?.endDate) {
    const currentEnd = new Date(existingActive.endDate);
    if (currentEnd > now) {
      base = currentEnd;
    }
  }

  const endDate = new Date(base);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
};
