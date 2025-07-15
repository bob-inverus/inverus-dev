const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const testData = [
  {
    id: '1',
    name: 'Aaron Smith',
    first_name: 'Aaron',
    email: 'aaron.smith@company.com',
    mobile_phone: '555-123-4567',
    address: '123 Main Street',
    city: 'Boston',
    state: 'MA',
    is_valid: true,
    result: 'verified',
    status: 'active'
  },
  {
    id: '2',
    name: 'Aaron Johnson',
    first_name: 'Aaron',
    email: 'aaron.johnson@gmail.com',
    mobile_phone: '555-987-6543',
    address: '456 Oak Avenue',
    city: 'New York',
    state: 'NY',
    is_valid: true,
    result: 'verified',
    status: 'active'
  },
  {
    id: '3',
    name: 'Aaron Brown',
    first_name: 'Aaron',
    email: 'aaron.brown@email.com',
    mobile_phone: '555-555-5555',
    address: '789 Pine Road',
    city: 'Los Angeles',
    state: 'CA',
    is_valid: true,
    result: 'verified',
    status: 'active'
  },
  {
    id: '4',
    name: 'John Smith',
    first_name: 'John',
    email: 'john.smith@company.com',
    mobile_phone: '555-111-2222',
    address: '321 Elm Street',
    city: 'Chicago',
    state: 'IL',
    is_valid: true,
    result: 'verified',
    status: 'active'
  }
]

async function addTestData() {
  try {
    console.log('Adding test data to search_data table...')
    
    const { data, error } = await supabase
      .from('search_data')
      .insert(testData)
      .select()
    
    if (error) {
      console.error('Error adding test data:', error)
      return
    }
    
    console.log('Successfully added test data:', data)
    console.log('Test data added successfully!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addTestData()
