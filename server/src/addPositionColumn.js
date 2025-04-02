// Script to add position column to folders table in Supabase
const supabase = require('./lib/supabase').default;

async function addPositionColumn() {
  try {
    console.log('Adding position column to folders table...');
    
    // Execute raw SQL to add the position column if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: 'ALTER TABLE folders ADD COLUMN IF NOT EXISTS position INTEGER'
    });
    
    if (error) {
      console.error('Error adding position column:', error);
      return;
    }
    
    console.log('Position column added successfully to folders table!');
    
    // Set initial position values based on creation date
    const { error: updateError } = await supabase.rpc('execute_sql', {
      sql_query: `
        UPDATE folders 
        SET position = subquery.row_num 
        FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as row_num 
          FROM folders
        ) AS subquery 
        WHERE folders.id = subquery.id
      `
    });
    
    if (updateError) {
      console.error('Error setting initial position values:', updateError);
      return;
    }
    
    console.log('Initial position values set based on creation date');
    console.log('Column addition completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Execute the function
addPositionColumn(); 
