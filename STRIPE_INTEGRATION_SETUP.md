# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for user tier upgrades in your application.

## 🔧 Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (created in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_pro_monthly_id
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly_id

# App URL for redirects
NEXT_PUBLIC_VERCEL_URL=http://localhost:3000
```

## 🏪 Stripe Dashboard Setup

### 1. Create Products and Prices

In your Stripe Dashboard:

1. **Go to Products** → Create new products:
   - **Pro Plan**: $19/month (or your preferred pricing)
   - **Enterprise Plan**: $99/month (or your preferred pricing)

2. **For each product**, create a price:
   - Set billing period to "Monthly" or "Yearly"
   - Copy the Price ID (starts with `price_`) to your environment variables

### 2. Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. **Add endpoint**: `https://yourdomain.com/api/stripe/webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET`

## 🔗 Features Implemented

### Payment Processing
- ✅ Stripe Checkout integration
- ✅ Subscription creation for Pro/Enterprise tiers
- ✅ Secure webhook handling for payment confirmation
- ✅ Automatic user tier updates after successful payment

### User Experience
- ✅ Tier badges next to user avatar (P for Pro, E for Enterprise)
- ✅ Upgrade buttons with Stripe payment flow
- ✅ Success toast notifications with automatic badge updates
- ✅ Loading states during payment processing
- ✅ Real-time tier updates via Supabase subscriptions

### UI Components
- ✅ `UpgradeButton` component with Stripe integration
- ✅ Consistent Lucide icons throughout upgrade flow
- ✅ Responsive design for mobile and desktop

## 🎯 User Flow

1. **User clicks "Upgrade to Pro"** → Opens Settings with Account tab
2. **User clicks upgrade button** → Redirects to Stripe Checkout
3. **User completes payment** → Redirected back to dashboard with success notification
4. **Webhook processes payment** → User tier updated in database
5. **Dashboard shows success toast** → User sees upgrade confirmation
6. **Badge updates automatically** → Pro/Enterprise badge appears via real-time sync

## 🔒 Security Features

- Webhook signature verification
- Secure environment variable handling
- Server-side tier validation
- Database transaction safety

## 🧪 Testing

### Test Mode Setup
1. Use Stripe test API keys (start with `pk_test_` and `sk_test_`)
2. Use test webhook endpoint for local development
3. Test with Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

### Local Development
```bash
# Install Stripe CLI for webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This will give you a webhook secret starting with whsec_
```

## 📱 Mobile Support

- Responsive upgrade buttons
- Mobile-optimized Stripe Checkout
- Touch-friendly tier badges
- Drawer/Dialog integration for settings

## 🛠️ Customization

### Pricing Changes
Update price IDs in environment variables when changing Stripe prices.

### UI Customization
- Tier badge colors in `app-nav-user.tsx`
- Upgrade button styling in `upgrade-button.tsx`
- Success toast notifications in `upgrade-success-toast.tsx`

### Feature Restrictions
Add tier-based feature restrictions in your components:

```typescript
import { useUser } from "@/lib/user-store/provider"

function PremiumFeature() {
  const { user } = useUser()
  const userTier = user?.tier || "basic"
  
  if (userTier === "basic") {
    return <UpgradePrompt />
  }
  
  return <PremiumContent />
}
```

## 📊 Analytics & Monitoring

Consider adding:
- Conversion tracking for upgrade attempts
- Failed payment monitoring
- User tier distribution analytics
- Revenue reporting

## 🚀 Production Deployment

1. **Switch to live API keys** in production environment
2. **Update webhook URLs** to production domain
3. **Test payment flow** thoroughly before launch
4. **Monitor webhook delivery** in Stripe Dashboard
5. **Set up alerts** for failed payments or webhook issues

## 🆘 Troubleshooting

### Common Issues

**Webhook not receiving events:**
- Check webhook URL is correct
- Verify webhook secret matches
- Ensure endpoint is publicly accessible

**Payment succeeds but tier not updated:**
- Check webhook logs in Stripe Dashboard
- Verify database connection in webhook handler
- Check user ID mapping in session metadata

**Tier badge not showing:**
- Confirm user data is refreshed after payment
- Check tier field in database
- Verify badge logic in component

### Debug Commands

```bash
# Check webhook events
stripe events list

# Test webhook locally
stripe trigger checkout.session.completed

# Monitor webhook deliveries
stripe listen --print-json
```

## 📞 Support

For Stripe-related issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Discord Community](https://discord.gg/stripe)
- [Stripe Support](https://support.stripe.com/)

For implementation questions, check the code comments in:
- `lib/stripe/config.ts`
- `app/api/stripe/webhook/route.ts`
- `app/components/stripe/upgrade-button.tsx` 