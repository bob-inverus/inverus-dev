# inVerus API Documentation

## Overview

The inVerus API provides programmatic access to our trust and verification services for Pro and Enterprise users. Our API allows you to search for people, verify information, and integrate our trust scoring system into your applications.

## Base URL

```
https://your-domain.com/api/v1
```

## Authentication

All API requests require authentication using an API key. Include your API key in the request headers:

```bash
Authorization: Bearer sk_live_your_api_key_here
```

Or use the `X-API-Key` header:

```bash
X-API-Key: sk_live_your_api_key_here
```

### Getting Your API Key

1. Upgrade to Pro or Enterprise tier
2. Go to Account Settings → API Keys
3. Click "Create New API Key"
4. Configure permissions and save your key securely

⚠️ **Important**: API keys are only shown once. Store them securely and never expose them in client-side code.

## Rate Limits

Rate limits vary by tier:

| Tier | Daily Requests | Monthly Requests | Per Minute | Burst Limit |
|------|----------------|------------------|------------|-------------|
| Basic | 0 | 0 | 0 | 0 |
| Pro | 1,000 | 25,000 | 50 | 100 |
| Enterprise | 10,000 | 250,000 | 200 | 500 |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per day
- `X-RateLimit-Remaining`: Requests remaining today
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Error Handling

The API uses conventional HTTP response codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions or tier)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

Error responses include details:

```json
{
  "error": "Rate limit exceeded",
  "message": "Daily rate limit exceeded. Limit: 1000 requests per day",
  "limits": {
    "requests_per_day": 1000,
    "requests_per_month": 25000,
    "requests_per_minute": 50,
    "burst_limit": 100
  }
}
```

## Endpoints

### 1. Search API

Search across our database using text queries.

#### GET /api/v1/search

**Parameters:**
- `q` (required) - Search query
- `limit` (optional) - Results per page (max 100, default 10)
- `offset` (optional) - Pagination offset (default 0)

**Example:**
```bash
curl -H "Authorization: Bearer sk_live_..." \
  "https://your-domain.com/api/v1/search?q=john+smith&limit=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": "123",
      "name": "John Smith",
      "email": "john@example.com",
      "score": 0.95,
      "verified": true
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 1
  },
  "meta": {
    "query": "john smith",
    "response_time_ms": 150,
    "credits_consumed": 0.1
  }
}
```

#### POST /api/v1/search (Batch Search)

**Request Body:**
```json
{
  "queries": ["john smith", "jane doe", "bob johnson"],
  "options": {
    "limit": 10
  }
}
```

**Response:**
```json
{
  "data": [
    {
      "query": "john smith",
      "data": [...],
      "error": null
    }
  ],
  "meta": {
    "queries_processed": 3,
    "response_time_ms": 300,
    "credits_consumed": 0.15
  }
}
```

**Batch Limits:**
- Pro: 10 queries per request
- Enterprise: 50 queries per request

### 2. People API

Search and lookup people in our verification database.

#### GET /api/v1/people

**Parameters:**
- `email` (optional) - Exact email match
- `name` (optional) - Name search (partial matches)
- `limit` (optional) - Results per page (max 100, default 10)
- `offset` (optional) - Pagination offset (default 0)

**Example:**
```bash
curl -H "Authorization: Bearer sk_live_..." \
  "https://your-domain.com/api/v1/people?email=john@example.com"
```

**Response:**
```json
{
  "data": [
    {
      "id": "456",
      "Name": "John Smith",
      "Email": "john@example.com",
      "First_name": "John",
      "Last_name": "Smith",
      "Mobile Phone": "1234567890",
      "Address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "Status": "active",
      "Is Valid": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 1
  },
  "meta": {
    "search_params": {
      "email": "john@example.com",
      "name": null
    },
    "response_time_ms": 200,
    "credits_consumed": 0.2
  }
}
```

#### POST /api/v1/people (Batch Lookup)

**Request Body:**
```json
{
  "people": [
    {"email": "john@example.com"},
    {"name": "Jane Doe"},
    {"email": "bob@company.com", "name": "Bob Johnson"}
  ],
  "enrich": true
}
```

**Response:**
```json
{
  "data": [
    {
      "input": {"email": "john@example.com"},
      "data": [...],
      "error": null,
      "enriched": true
    }
  ],
  "meta": {
    "people_processed": 3,
    "enrichment_enabled": true,
    "response_time_ms": 500,
    "credits_consumed": 0.9
  }
}
```

**Batch Limits:**
- Pro: 25 people per request
- Enterprise: 100 people per request

**Enrichment:**
- Available for Pro and Enterprise tiers
- Includes additional social profiles and verification data
- Costs 0.3 credits per person (vs 0.1 without enrichment)

## SDK Examples

### JavaScript/Node.js

```javascript
class InVerusAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://your-domain.com/api/v1';
  }

  async search(query, options = {}) {
    const url = new URL(`${this.baseURL}/search`);
    url.searchParams.set('q', query);
    if (options.limit) url.searchParams.set('limit', options.limit);
    if (options.offset) url.searchParams.set('offset', options.offset);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async lookupPerson(email) {
    const url = new URL(`${this.baseURL}/people`);
    url.searchParams.set('email', email);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async batchLookup(people, enrich = false) {
    const response = await fetch(`${this.baseURL}/people`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ people, enrich })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }
}

// Usage
const api = new InVerusAPI('sk_live_your_api_key_here');

// Search
const searchResults = await api.search('john smith');

// Lookup person by email
const person = await api.lookupPerson('john@example.com');

// Batch lookup with enrichment
const batchResults = await api.batchLookup([
  { email: 'john@example.com' },
  { name: 'Jane Doe' }
], true);
```

### Python

```python
import requests
import json

class InVerusAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://your-domain.com/api/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def search(self, query, limit=10, offset=0):
        url = f'{self.base_url}/search'
        params = {'q': query, 'limit': limit, 'offset': offset}
        
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def lookup_person(self, email=None, name=None):
        url = f'{self.base_url}/people'
        params = {}
        if email:
            params['email'] = email
        if name:
            params['name'] = name
            
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def batch_lookup(self, people, enrich=False):
        url = f'{self.base_url}/people'
        data = {'people': people, 'enrich': enrich}
        
        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()
        return response.json()

# Usage
api = InVerusAPI('sk_live_your_api_key_here')

# Search
results = api.search('john smith')

# Lookup person
person = api.lookup_person(email='john@example.com')

# Batch lookup
batch_results = api.batch_lookup([
    {'email': 'john@example.com'},
    {'name': 'Jane Doe'}
], enrich=True)
```

### cURL

```bash
# Search
curl -H "Authorization: Bearer sk_live_your_api_key_here" \
  "https://your-domain.com/api/v1/search?q=john+smith&limit=10"

# Lookup person by email
curl -H "Authorization: Bearer sk_live_your_api_key_here" \
  "https://your-domain.com/api/v1/people?email=john@example.com"

# Batch lookup with enrichment
curl -X POST \
  -H "Authorization: Bearer sk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "people": [
      {"email": "john@example.com"},
      {"name": "Jane Doe"}
    ],
    "enrich": true
  }' \
  "https://your-domain.com/api/v1/people"
```

## Security Best Practices

1. **Store API keys securely** - Never expose them in client-side code
2. **Use HTTPS only** - All API calls must use HTTPS
3. **Rotate keys regularly** - Generate new keys periodically
4. **Implement proper error handling** - Don't expose sensitive information
5. **Monitor usage** - Track API usage in your dashboard
6. **Set CORS origins** - Restrict origins for browser-based requests

## CORS Support

For browser-based applications, configure allowed origins when creating your API key. The API supports:

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`
- `Access-Control-Max-Age`

## Webhooks (Enterprise Only)

Enterprise customers can configure webhooks to receive real-time updates:

- Data verification completions
- Trust score changes
- Usage threshold alerts

Contact support to set up webhooks for your account.

## Support

- **Documentation**: This guide
- **Dashboard**: Manage keys and view usage at `/settings`
- **Status Page**: Check API status and uptime
- **Support**: Contact our team for technical assistance

## Changelog

- **v1.0** - Initial API release with search and people endpoints
- Rate limiting and tier-based access controls
- Comprehensive error handling and logging
- SDK examples and documentation
