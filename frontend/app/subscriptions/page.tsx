'use client';

import { useEffect, useState } from 'react';
import { subscriptionApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiCheck } from 'react-icons/fi';

interface Plan {
  tier: string;
  price: number | string;
  features: string[];
  limitations: string[];
}

export default function SubscriptionsPage() {
  const user = useAuthStore((state) => state.user);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionApi.getPlans();
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    try {
      await subscriptionApi.create({ tier, billingCycle: 'monthly' });
      alert('Subscription created successfully!');
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Subscription failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading plans...</div>
      </div>
    );
  }

  const planList = Object.values(plans);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-4 text-center">Choose Your Plan</h1>
        <p className="text-gray-400 text-center mb-12">
          Select the perfect plan for your needs
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {planList.map((plan) => (
            <div
              key={plan.tier}
              className={`bg-gray-800 rounded-lg p-6 ${
                plan.tier === 'premium' || plan.tier === 'pro'
                  ? 'border-2 border-primary-500'
                  : 'border border-gray-700'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2 capitalize">{plan.tier}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">
                  {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                </span>
                {typeof plan.price === 'number' && (
                  <span className="text-gray-400">/month</span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-500">
                    <span className="text-sm">• {limitation}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={user?.subscriptionTier === plan.tier}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  user?.subscriptionTier === plan.tier
                    ? 'bg-gray-700 cursor-not-allowed'
                    : plan.tier === 'premium' || plan.tier === 'pro'
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {user?.subscriptionTier === plan.tier ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

