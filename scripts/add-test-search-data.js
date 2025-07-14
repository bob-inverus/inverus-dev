const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const testData = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    mobile_phone: '555-0123',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    status: 'active',
    line_type: 'mobile',
    is_valid: true,
    result: 'verified',
    reg_date: new Date().toISOString()
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    mobile_phone: '555-0456',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    status: 'active',
    line_type: 'mobile',
    is_valid: true,
    result: 'verified',
    reg_date: new Date().toISOString()
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@test.com',
    first_name: 'Bob',
    last_name: 'Johnson',
    mobile_phone: '555-0789',
    address: '789 Pine Rd',
    city: 'Chicago',
    state: 'IL',
    status: 'active',
    line_type: 'mobile',
    is_valid: true,
    result: 'verified',
    reg_date: new Date().toISOString()
  },
  {
    name: 'Alice Brown',
    email: 'alice.brown@demo.com',
    first_name: 'Alice',
    last_name: 'Brown',
    mobile_phone: '555-0321',
    address: '321 Elm St',
    city: 'Houston',
    state: 'TX',
    status: 'active',
    line_type: 'mobile',
    is_valid: true,
    result: 'verified',
    reg_date: new Date().toISOString()
  }
]

async function addTestData() {
  try {
    console.log('Adding test data to people_db table...')
    
    const { data, error } = await supabase
      .from('people_db')
      .insert(testData)
      .select()
    
    if (error) {
      console.error('Error inserting test data:', error)
      return
    }
    
    console.log('✅ Successfully added test data:')
    console.log(`   - ${testData.length} records inserted`)
    console.log('   - Records:', testData.map(d => `${d.name} (${d.email})`).join(', '))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addTestData() 