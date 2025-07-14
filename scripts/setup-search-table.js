const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTable() {
  try {
    console.log('Setting up people_db table...');
    
    // Create table with flexible structure
    const { error: createError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS people_db (
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
        
        -- Enable Row Level Security
        ALTER TABLE people_db ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON people_db
          FOR SELECT USING (true);
        
        CREATE POLICY IF NOT EXISTS "Enable insert for service role" ON people_db
          FOR INSERT WITH CHECK (auth.role() = 'service_role');
        
        CREATE POLICY IF NOT EXISTS "Enable update for service role" ON people_db
          FOR UPDATE USING (auth.role() = 'service_role');
        
        -- Create indexes for better search performance
        CREATE INDEX IF NOT EXISTS idx_people_db_name ON people_db(name);
        CREATE INDEX IF NOT EXISTS idx_people_db_email ON people_db(email);
        CREATE INDEX IF NOT EXISTS idx_people_db_first_name ON people_db(first_name);
        CREATE INDEX IF NOT EXISTS idx_people_db_last_name ON people_db(last_name);
        CREATE INDEX IF NOT EXISTS idx_people_db_mobile_phone ON people_db(mobile_phone);
        CREATE INDEX IF NOT EXISTS idx_people_db_city ON people_db(city);
        CREATE INDEX IF NOT EXISTS idx_people_db_state ON people_db(state);
      `
    });

    if (createError) {
      console.error('Error creating table:', createError);
      process.exit(1);
    }

    console.log('✅ Table created successfully!');

    // Add sample data
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

    console.log('Adding sample data...');
    const { data, error } = await supabase
      .from('people_db')
      .insert(sampleData)
      .select();

    if (error) {
      console.error('Error inserting sample data:', error);
    } else {
      console.log(`✅ Successfully added ${data.length} sample records!`);
      console.log('Sample data:');
      data.forEach((record, index) => {
        console.log(`${index + 1}. ${record.name} - ${record.email} - ${record.city}, ${record.state}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupTable(); 