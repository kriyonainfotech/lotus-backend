import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

export const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  return razorpayInstance;
};

export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || '';

export const verifyPaymentSignature = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === razorpay_signature;
};

export const createRazorpayOrder = async ({ amountPaise, receipt, notes }) => {
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes,
  });
};

export const fetchRazorpayOrder = async (orderId) => {
  const razorpay = getRazorpay();
  return razorpay.orders.fetch(orderId);
};
