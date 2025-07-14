# Database Search Setup Guide

This guide explains how to set up the database search functionality that allows Mistral AI to search and return user data from your Supabase database.

## 🗄️ Database Setup

### 1. Create the Search Data Table

Run the migration script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of migrations/add-search-data-table.sql
```

This will create:
- `search_data` table with all your CSV headers
- Indexes for better search performance
- Full-text search capabilities
- Row Level Security (RLS) policies
- A search function `search_user_data()`

### 2. Import Your CSV Data

Use the provided import script to populate the database:

```bash
# Install dependencies (if not already installed)
npm install csv-parser

# Import your CSV file
node scripts/import-csv.js path/to/your/data.csv
```

The script expects CSV headers:
- `reg_date` - Registration date
- `Name` - Full name
- `Email` - Email address
- `Result` - Result field
- `Is Valid` - Boolean validation status
- `Mobile Phone` - Phone number
- `Line Type` - Line type
- `Status` - Status field
- `First_name` - First name
- `Last_name` - Last name
- `Address` - Address
- `city` - City
- `state` - State

## 🔧 API Endpoints

### Search API

**Endpoint**: `/api/search`

**Methods**: GET, POST

**Parameters**:
- `q` (query parameter for GET) or `query` (body parameter for POST)

**Example**:
```bash
# GET request
curl "http://localhost:3000/api/search?q=john"

# POST request
curl -X POST "http://localhost:3000/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "john"}'
```

**Response**:
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "mobile_phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "status": "active",
      "line_type": "mobile",
      "is_valid": true,
      "result": "verified",
      "reg_date": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "query": "john"
}
```

## 🤖 AI Integration

### How It Works

1. **User Query**: User asks Mistral to search for someone (e.g., "Find John Smith")
2. **Tool Activation**: Mistral uses the `searchUserData` tool
3. **Database Search**: The tool calls `/api/search` with the query
4. **Results**: Mistral receives formatted results and presents them to the user

### Search Tool

The search tool is automatically available when:
- `enableSearch` is true in the chat interface
- User is authenticated (for security)
- Database is properly configured

### Example Queries

Users can ask Mistral:
- "Find John Smith"
- "Search for email john@example.com"
- "Look up phone number 555-1234"
- "Find all users in New York"
- "Search for people with status active"

## 🔍 Search Capabilities

### Full-Text Search
- Searches across name, email, phone, address, city, state
- Uses PostgreSQL's full-text search with ranking
- Case-insensitive matching

### Field-Specific Search
- Exact matches on specific fields
- Partial matches with ILIKE
- Boolean field support

### Performance Features
- Indexed searches for common fields
- Limited to 100 results per query
- Optimized for fast response times

## 🛡️ Security Features

### Row Level Security (RLS)
- Only authenticated users can search
- Service role can manage data
- Proper access controls

### API Protection
- Input validation and sanitization
- Error handling and logging
- Rate limiting (via existing middleware)

## 📊 Database Schema

```sql
CREATE TABLE search_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_date TIMESTAMPTZ,
  name TEXT,
  email TEXT,
  result TEXT,
  is_valid BOOLEAN,
  mobile_phone TEXT,
  line_type TEXT,
  status TEXT,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Testing

### 1. Test the API Directly
```bash
curl "http://localhost:3000/api/search?q=test"
```

### 2. Test with Mistral
1. Start a chat with Mistral
2. Enable search (if there's a toggle)
3. Ask: "Search for John in the database"
4. Mistral should use the search tool and return results

### 3. Verify Database
```sql
-- Check if data was imported
SELECT COUNT(*) FROM search_data;

-- Test the search function
SELECT * FROM search_user_data('john');
```

## 🔧 Troubleshooting

### Common Issues

1. **"Database not available"**
   - Check Supabase environment variables
   - Verify connection in `.env.local`

2. **"Search failed"**
   - Check RLS policies are correctly set
   - Verify user authentication

3. **No results returned**
   - Check if data was imported correctly
   - Test the search function directly in SQL

4. **Tool not available**
   - Ensure `enableSearch` is true
   - Check if search tool is properly imported

### Debug Steps

1. Check API endpoint: `GET /api/search?q=test`
2. Check database function: `SELECT * FROM search_user_data('test')`
3. Check RLS policies in Supabase dashboard
4. Verify environment variables are loaded

## 📝 Usage Examples

### Basic Search
```
User: "Find John Smith"
Mistral: *Uses search tool* → Returns John Smith's details from database
```

### Email Search
```
User: "Look up john@example.com"
Mistral: *Uses search tool* → Returns user with that email
```

### Location Search
```
User: "Find all users in California"
Mistral: *Uses search tool* → Returns users with state = "CA"
```

### Phone Search
```
User: "Search for phone number 555-1234"
Mistral: *Uses search tool* → Returns user with that phone number
```

The search functionality is now fully integrated and ready to use! Mistral can intelligently search your database and return relevant user information based on natural language queries. 