const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleData = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    mobile_phone: '555-1234',
    city: 'New York',
    state: 'NY',
    address: '123 Main St',
    status: 'active',
    is_valid: true,
    result: 'verified',
    line_type: 'mobile'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    mobile_phone: '555-5678',
    city: 'Los Angeles',
    state: 'CA',
    address: '456 Oak Ave',
    status: 'active',
    is_valid: true,
    result: 'verified',
    line_type: 'mobile'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    first_name: 'Bob',
    last_name: 'Johnson',
    mobile_phone: '555-9012',
    city: 'Chicago',
    state: 'IL',
    address: '789 Pine Rd',
    status: 'inactive',
    is_valid: false,
    result: 'pending',
    line_type: 'landline'
  },
  {
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    first_name: 'Alice',
    last_name: 'Brown',
    mobile_phone: '555-3456',
    city: 'Houston',
    state: 'TX',
    address: '321 Elm St',
    status: 'active',
    is_valid: true,
    result: 'verified',
    line_type: 'mobile'
  },
  {
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    first_name: 'Charlie',
    last_name: 'Wilson',
    mobile_phone: '555-7890',
    city: 'Phoenix',
    state: 'AZ',
    address: '654 Maple Dr',
    status: 'active',
    is_valid: true,
    result: 'verified',
    line_type: 'mobile'
  }
];

async function addSampleData() {
  try {
    console.log('Adding sample data to people_db table...');
    
    const { data, error } = await supabase
      .from('people_db')
      .insert(sampleData)
      .select();
    
    if (error) {
      console.error('Error inserting data:', error);
      process.exit(1);
    }
    
    console.log(`✅ Successfully added ${data.length} sample records!`);
    console.log('Sample data:');
    data.forEach((record, index) => {
      console.log(`${index + 1}. ${record.name} - ${record.email} - ${record.city}, ${record.state}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleData(); 