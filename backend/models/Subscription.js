import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tier: {
    type: String,
    enum: ['free', 'premium', 'pro', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'past_due'],
    default: 'inactive'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'mobile_money', 'bank_transfer', 'other']
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'chapa', 'paypal', 'other']
  },
  paymentProviderId: String, // External payment provider subscription ID
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  nextBillingDate: Date,
  cancelledAt: Date,
  cancellationReason: String,
  paymentHistory: [{
    amount: Number,
    currency: String,
    paymentDate: Date,
    paymentMethod: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded']
    },
    invoiceUrl: String
  }],
  features: {
    adFree: { type: Boolean, default: false },
    hdQuality: { type: Boolean, default: false },
    downloads: { type: Boolean, default: false },
    earlyAccess: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ status: 1 });

export default mongoose.model('Subscription', subscriptionSchema);

