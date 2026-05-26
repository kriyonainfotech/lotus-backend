import PricingPlan from '../models/PricingPlan.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { sendPurchaseEmail } from '../services/emailService.js';
import {
  createRazorpayOrder,
  fetchRazorpayOrder,
  getRazorpayKeyId,
  verifyPaymentSignature,
} from '../services/razorpayService.js';
import {
  computeSubscriptionEndDate,
  getActiveSubscription,
} from '../services/subscriptionService.js';

/**
 * GET /api/purchase/plans
 * Public list of active plans for the mobile app.
 */
export const getActivePlans = async (req, res) => {
  try {
    const plans = await PricingPlan.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/purchase/status
 * Current user's subscription / Pro access.
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const subscription = await getActiveSubscription(user._id);

    return res.status(200).json({
      success: true,
      isPro: Boolean(subscription),
      subscription,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/purchase/create-order
 * Body: { planId }
 */
export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'planId is required' });
    }

    const plan = await PricingPlan.findOne({ _id: planId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found or inactive' });
    }

    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const amountPaise = Math.round(plan.price * 100);
    const receipt = `lotus_${user._id.toString().slice(-8)}_${Date.now()}`;

    const order = await createRazorpayOrder({
      amountPaise,
      receipt,
      notes: {
        planId: plan._id.toString(),
        userId: user._id.toString(),
        planName: plan.name,
      },
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      plan: {
        id: plan._id,
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        badge: plan.badge,
        description: plan.description,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const message = error.message?.includes('not configured')
      ? 'Payment gateway is not configured'
      : 'Failed to create payment order';
    return res.status(500).json({ success: false, message });
  }
};

/**
 * POST /api/purchase/verify
 * Body: { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      planId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!planId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification fields',
      });
    }

    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const razorpayOrder = await fetchRazorpayOrder(razorpay_order_id);
    const expectedAmount = Math.round(plan.price * 100);

    if (razorpayOrder.status !== 'paid' && razorpayOrder.status !== 'attempted') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    if (Number(razorpayOrder.amount) !== expectedAmount) {
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
    }

    const orderPlanId = razorpayOrder.notes?.planId;
    if (orderPlanId && orderPlanId !== planId.toString()) {
      return res.status(400).json({ success: false, message: 'Plan mismatch for this order' });
    }

    const duplicate = await Subscription.findOne({ paymentId: razorpay_payment_id });
    if (duplicate) {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed',
        subscription: duplicate,
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingActive = await getActiveSubscription(user._id);
    const endDate = computeSubscriptionEndDate(plan.durationDays, existingActive);

    const subscription = await Subscription.create({
      userId: user._id,
      planId: plan._id,
      planName: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      endDate,
      status: 'active',
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    if (user.email) {
      sendPurchaseEmail(user.email, user.name || 'Valued Member', plan.name).catch((err) =>
        console.error('Error in sendPurchaseEmail trigger:', err),
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription activated',
      subscription,
      isPro: true,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};
