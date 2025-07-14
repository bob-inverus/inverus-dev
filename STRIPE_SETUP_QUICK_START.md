# Quick Stripe Setup Guide

## 🚨 Fix "Failed to load Stripe.js" Error

This error occurs when the Stripe publishable key is missing or invalid.

## Step 1: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API Keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)

## Step 2: Create Environment File

Create a file named `.env.local` in your project root:

```env
# Stripe Configuration (REQUIRED)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here

# App Configuration (REQUIRED)
NEXT_PUBLIC_VERCEL_URL=http://localhost:3000

# Stripe Products (Set these up later)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_your_pro_price_id
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id

# Stripe Webhooks (Set up later)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Your existing Supabase keys (if you have them)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Restart Your Development Server

```bash
# Stop your current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 4: Test the Fix

1. Go to your app
2. Click "Upgrade to Pro"
3. Check the browser console for any error messages

## Step 5: Set Up Stripe Products (After Basic Setup Works)

1. In Stripe Dashboard, go to **Products**
2. Create a "Pro Plan" product
3. Add a price (e.g., $19/month)
4. Copy the Price ID (starts with `price_`) 
5. Update `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` in your `.env.local`

## Troubleshooting

### ❌ "Failed to load Stripe.js"
- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify the key starts with `pk_test_` (test mode) or `pk_live_` (live mode)
- Restart your development server

### ❌ "Stripe not configured" 
- Check that `STRIPE_SECRET_KEY` is set in `.env.local`
- Verify the key starts with `sk_test_` or `sk_live_`

### ❌ "Price ID not configured"
- You can test basic Stripe loading first before setting up products
- Set up products in Stripe Dashboard and copy the price IDs

## Quick Test Setup

For immediate testing, you can use Stripe's test mode with these example values:

```env
# Replace with your actual test keys from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123def456ghi789jkl...
STRIPE_SECRET_KEY=sk_test_51ABC123def456ghi789jkl...
NEXT_PUBLIC_VERCEL_URL=http://localhost:3000
```

**Never commit your `.env.local` file to version control!** 