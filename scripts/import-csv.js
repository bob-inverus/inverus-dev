const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importCSV(filePath) {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Map CSV headers to database columns
        const row = {
          reg_date: data.reg_date ? new Date(data.reg_date).toISOString() : null,
          name: data.Name || null,
          email: data.Email || null,
          result: data.Result || null,
          is_valid: data['Is Valid'] === 'true' || data['Is Valid'] === 'TRUE' || data['Is Valid'] === '1',
          mobile_phone: data['Mobile Phone'] || null,
          line_type: data['Line Type'] || null,
          status: data.Status || null,
          first_name: data.First_name || null,
          last_name: data.Last_name || null,
          address: data.Address || null,
          city: data.city || null,
          state: data.state || null,
        };
        results.push(row);
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${results.length} rows from CSV`);
          
          // Insert data in batches of 100
          const batchSize = 100;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            
            const { error } = await supabase
              .from('people_db')
              .insert(batch);
            
            if (error) {
              console.error('Error inserting batch:', error);
              reject(error);
              return;
            }
            
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)}`);
          }
          
          console.log('✅ CSV import completed successfully!');
          resolve(results);
        } catch (error) {
          console.error('Error during import:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Get CSV file path from command line arguments
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('Usage: node scripts/import-csv.js <path-to-csv-file>');
  process.exit(1);
}

if (!fs.existsSync(csvFilePath)) {
  console.error(`File not found: ${csvFilePath}`);
  process.exit(1);
}

console.log(`Starting CSV import from: ${csvFilePath}`);
importCSV(csvFilePath)
  .then(() => {
    console.log('Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 