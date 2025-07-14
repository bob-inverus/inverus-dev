#!/bin/bash

echo "🚀 Starting Stripe webhook forwarding..."
echo "📝 Make sure to copy the webhook secret to your .env.local file"
echo ""

# Start Stripe CLI webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

echo ""
echo "✅ Webhook forwarding stopped" 