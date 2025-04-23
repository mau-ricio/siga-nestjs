// Check tenant database tables script
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

function checkTenantDatabase() {
  const dbPath = path.resolve(process.cwd(), 'sharedDB.sqlite');
  
  // Check if the database file exists
  if (!fs.existsSync(dbPath)) {
    console.error(`Database file not found at: ${dbPath}`);
    return;
  }
  
  console.log(`Opening database at: ${dbPath}`);
  
  // Open the database
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return;
    }
    
    console.log('Connected to the tenant database');
    
    // List all tables
    db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
      if (err) {
        console.error('Error querying tables:', err.message);
        return;
      }
      
      console.log('Tables in the database:');
      console.log(tables);
      
      // Check if users table exists
      const usersTableExists = tables.some(table => table.name === 'users');
      
      if (usersTableExists) {
        // Get structure of users table
        db.all(`PRAGMA table_info(users)`, [], (err, columns) => {
          if (err) {
            console.error('Error querying users table structure:', err.message);
            return;
          }
          
          console.log('Structure of users table:');
          console.log(columns);
          
          // Check if there are any records
          db.get(`SELECT COUNT(*) as count FROM users`, [], (err, row) => {
            if (err) {
              console.error('Error counting users:', err.message);
            } else {
              console.log('Number of records in users table:', row.count);
            }
            
            // Close the database connection
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err.message);
              }
              console.log('Database connection closed');
            });
          });
        });
      } else {
        console.log('Users table does not exist in the database');
        
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          }
          console.log('Database connection closed');
        });
      }
    });
  });
}

// Run the function
checkTenantDatabase();

// Add a delay before exiting to ensure async callbacks complete
setTimeout(() => {
  console.log('Script execution complete');
}, 1000);
