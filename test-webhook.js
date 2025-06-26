const crypto = require('crypto')

// Test webhook payload
const payload = JSON.stringify({
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_session',
      object: 'checkout.session',
      metadata: {
        userId: '79ce05d3-6e97-4d2d-817b-ce02e312c904',
        tier: 'pro'
      }
    }
  }
})

// Create signature (using webhook secret from .env.local)
const webhookSecret = 'whsec_c29d54b5de1630280aea6ba89c13ac5d64fef8b7611eccb4866cbff508b51136'
const timestamp = Math.floor(Date.now() / 1000)
const signedPayload = timestamp + '.' + payload
const signature = crypto.createHmac('sha256', webhookSecret.replace('whsec_', '')).update(signedPayload).digest('hex')
const stripeSignature = `t=${timestamp},v1=${signature}`

console.log('Sending test webhook...')
console.log('Payload:', payload)
console.log('Signature:', stripeSignature)

// Send to webhook endpoint
fetch('http://localhost:3000/api/stripe/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature
  },
  body: payload
})
.then(response => response.json())
.then(data => {
  console.log('Response:', data)
})
.catch(error => {
  console.error('Error:', error)
}) 