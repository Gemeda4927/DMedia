import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = express.Router();

// Get subscription plans
router.get('/plans', (req, res) => {
  const plans = {
    free: {
      tier: 'free',
      price: 0,
      features: ['Basic content', 'Limited access', '720p quality'],
      limitations: ['Ads', 'No downloads']
    },
    premium: {
      tier: 'premium',
      price: 9.99,
      features: ['All content', 'HD streaming', 'Ad-free'],
      limitations: ['No downloads']
    },
    pro: {
      tier: 'pro',
      price: 19.99,
      features: ['All content', 'HD/4K streaming', 'Downloads', 'Early access'],
      limitations: []
    },
    enterprise: {
      tier: 'enterprise',
      price: 'custom',
      features: ['White-label', 'API access', 'Custom features'],
      limitations: []
    }
  };

  res.json({ plans });
});

// Get user's subscription
router.get('/current', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user._id,
      status: { $in: ['active', 'past_due'] }
    }).sort({ createdAt: -1 });

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create subscription
router.post('/', authenticate, async (req, res) => {
  try {
    const { tier, paymentMethod, paymentProvider, billingCycle = 'monthly' } = req.body;

    // Calculate amount based on tier
    const tierPrices = {
      premium: { monthly: 9.99, yearly: 99.99 },
      pro: { monthly: 19.99, yearly: 199.99 }
    };

    const amount = tierPrices[tier]?.[billingCycle] || 0;

    // In production, integrate with payment providers here
    // For now, create subscription directly

    const subscription = new Subscription({
      userId: req.user._id,
      tier,
      amount,
      billingCycle,
      paymentMethod,
      paymentProvider,
      status: 'active',
      startDate: new Date(),
      endDate: billingCycle === 'monthly' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      nextBillingDate: billingCycle === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      features: {
        adFree: tier !== 'free',
        hdQuality: tier !== 'free',
        downloads: tier === 'pro' || tier === 'enterprise',
        earlyAccess: tier === 'pro' || tier === 'enterprise',
        apiAccess: tier === 'enterprise'
      }
    });

    await subscription.save();

    // Update user subscription
    await User.findByIdAndUpdate(req.user._id, {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionExpiresAt: subscription.endDate
    });

    res.status(201).json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    // Update user - subscription remains active until expiry
    await User.findByIdAndUpdate(req.user._id, {
      subscriptionStatus: 'cancelled'
    });

    res.json({ message: 'Subscription cancelled', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

