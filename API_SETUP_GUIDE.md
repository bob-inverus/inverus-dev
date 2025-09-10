# inVerus API System Setup Guide

This guide will help you set up the complete API system for your inVerus application, including API key management, authentication, rate limiting, and client access.

## Overview

The API system provides:
- ✅ **Tier-based API access** (Pro: 1K/day, Enterprise: 10K/day)
- ✅ **Secure API key authentication** with SHA-256 hashing
- ✅ **Rate limiting** with burst protection
- ✅ **Usage tracking** and monitoring
- ✅ **Permission-based access control**
- ✅ **CORS support** for browser clients
- ✅ **Comprehensive error handling**
- ✅ **SDK examples** and documentation

## 1. Database Setup

### Step 1: Run Database Migrations

Execute these SQL files in order:

```bash
# 1. Create API keys tables
psql -d your_database -f migrations/create-api-keys-table.sql

# 2. Add helper functions
psql -d your_database -f migrations/api-functions.sql
```

### Step 2: Verify Tables Created

Check that these tables exist:
- `api_keys` - Stores API key metadata
- `api_usage_logs` - Tracks API usage

```sql
-- Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('api_keys', 'api_usage_logs');
```

## 2. Environment Configuration

Add these environment variables to your `.env.local`:

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key

# Optional: API rate limiting overrides
API_RATE_LIMIT_PRO_DAILY=1000
API_RATE_LIMIT_ENTERPRISE_DAILY=10000
```

## 3. Integration Steps

### Step 1: Add API Keys Section to User Settings

Update your settings component to include the API keys section:

```typescript
// app/components/layout/settings/settings-content.tsx
import { ApiKeysSection } from './api/api-keys-section'

// Add to your settings tabs:
{tab === 'api' && <ApiKeysSection />}
```

### Step 2: Add API Tab to Settings Navigation

```typescript
// Add to your settings tabs array:
const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'account', label: 'Account', icon: User },
  { id: 'models', label: 'Models', icon: Brain },
  { id: 'api', label: 'API Keys', icon: Key }, // Add this
  { id: 'connections', label: 'Connections', icon: Link }
]
```

### Step 3: Update User Types (if needed)

Ensure your user types include the tier field:

```typescript
// app/types/user.ts
export type UserTier = 'basic' | 'pro' | 'enterprise'
```

## 4. API Endpoints

The system creates these endpoints automatically:

### Management Endpoints (Internal)
- `GET /api/user-api-keys` - List user's API keys
- `POST /api/user-api-keys` - Create new API key
- `DELETE /api/user-api-keys?keyId=...` - Deactivate API key

### Client Endpoints (External)
- `GET /api/v1/search` - Search API
- `POST /api/v1/search` - Batch search
- `GET /api/v1/people` - People lookup
- `POST /api/v1/people` - Batch people lookup

## 5. Rate Limits by Tier

| Tier | Daily | Monthly | Per Minute | Burst | Max Keys |
|------|-------|---------|------------|-------|----------|
| Basic | 0 | 0 | 0 | 0 | 0 |
| Pro | 1,000 | 25,000 | 50 | 100 | 3 |
| Enterprise | 10,000 | 250,000 | 200 | 500 | 10 |

## 6. Testing the API

### Step 1: Create an API Key

1. Upgrade a user to Pro or Enterprise tier
2. Go to Settings → API Keys
3. Click "Create Key"
4. Set permissions and save the key

### Step 2: Test Authentication

```bash
# Test with invalid key (should return 401)
curl -H "Authorization: Bearer invalid_key" \
  "http://localhost:3000/api/v1/search?q=test"

# Test with valid key
curl -H "Authorization: Bearer sk_live_your_key_here" \
  "http://localhost:3000/api/v1/search?q=john+smith"
```

### Step 3: Test Rate Limiting

```bash
# Make multiple rapid requests to test rate limiting
for i in {1..60}; do
  curl -H "Authorization: Bearer sk_live_your_key_here" \
    "http://localhost:3000/api/v1/search?q=test$i" &
done
```

## 7. Monitoring and Maintenance

### Usage Monitoring

Users can monitor their API usage in the dashboard:
- Real-time usage statistics
- Request logs and history
- Rate limit status
- Credits consumed

### Database Maintenance

Set up periodic cleanup of old logs:

```sql
-- Run weekly to clean up logs older than 90 days
SELECT cleanup_old_api_logs();
```

### Reset Counters

Daily and monthly counters reset automatically, but you can manually reset if needed:

```sql
-- Reset daily counters
SELECT reset_daily_api_counters();

-- Reset monthly counters  
SELECT reset_monthly_api_counters();
```

## 8. Security Considerations

### API Key Security
- ✅ Keys are hashed with SHA-256 before storage
- ✅ Only key prefixes are shown in UI
- ✅ Keys are only displayed once during creation
- ✅ Inactive keys are immediately blocked

### Request Security
- ✅ CORS validation for browser requests
- ✅ Permission-based endpoint access
- ✅ IP address logging for audit trails
- ✅ Request validation and sanitization

### Rate Limiting
- ✅ Multiple rate limit types (daily, monthly, per-minute, burst)
- ✅ Tier-based limits with automatic enforcement
- ✅ Graceful degradation with proper error messages

## 9. Client Integration Examples

### JavaScript/Node.js

```javascript
const api = new InVerusAPI('sk_live_your_key_here')
const results = await api.search('john smith')
```

### Python

```python
api = InVerusAPI('sk_live_your_key_here')
results = api.search('john smith')
```

### cURL

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  "https://your-domain.com/api/v1/search?q=john+smith"
```

## 10. Troubleshooting

### Common Issues

**"API access requires Pro or Enterprise tier"**
- Solution: Upgrade user tier in database or via Stripe

**"Invalid API key"**
- Check key format (should start with `sk_live_`)
- Verify key is active and not expired
- Check database connection

**"Rate limit exceeded"**
- Check current usage vs. tier limits
- Consider upgrading tier or optimizing requests

**"Missing required permission"**
- Update API key permissions to include required scope
- Check endpoint permission requirements

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

This will show detailed authentication and rate limiting logs.

## 11. Performance Optimization

### Database Indexes

The system includes optimized indexes for:
- API key lookups by hash
- Usage log queries by date/user
- Rate limiting counter updates

### Caching

Consider adding Redis for:
- Rate limiting counters
- API key validation cache
- Usage statistics cache

## 12. Scaling Considerations

### High Traffic

For high-traffic scenarios:
- Use Redis for rate limiting
- Implement API key caching
- Add database read replicas
- Consider API gateway (Kong, AWS API Gateway)

### Multi-Region

For global deployment:
- Replicate API keys across regions
- Sync usage counters periodically
- Use edge caching for static responses

## 13. Compliance and Legal

### Data Privacy
- API logs include IP addresses and user agents
- Implement data retention policies
- Consider GDPR compliance for EU users

### Terms of Service
- Update ToS to include API usage terms
- Define acceptable use policies
- Set up abuse monitoring and prevention

## 🎉 Setup Complete!

Your API system is now ready for Pro and Enterprise users. The system includes:

- ✅ Complete API key management UI
- ✅ Secure authentication and authorization
- ✅ Tier-based rate limiting
- ✅ Usage tracking and monitoring
- ✅ Comprehensive documentation
- ✅ Multiple client SDKs
- ✅ Production-ready security

## Next Steps

1. **Test thoroughly** with different user tiers
2. **Monitor usage patterns** and adjust limits if needed
3. **Gather user feedback** on API design and features
4. **Consider additional endpoints** based on user needs
5. **Set up monitoring alerts** for high usage or errors

For support or questions, refer to the API documentation or contact your development team.
