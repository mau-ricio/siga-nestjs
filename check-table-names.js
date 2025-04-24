const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database
const db = new sqlite3.Database('./sharedDB.sqlite', (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
    return;
  }
  console.log('Connected to sharedDB.sqlite');
  
  // List all tables with their exact names as stored in SQLite
  db.all(`SELECT name, type, sql FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
    if (err) {
      console.error('Error listing tables:', err.message);
      db.close();
      return;
    }
    
    console.log('All tables in database:');
    tables.forEach(table => {
      console.log(`Table name: "${table.name}" (type: ${table.type})`);
      console.log(`Creation SQL: ${table.sql}`);
      console.log('---');
    });
    
    // Check specifically for any tables containing "user" in their name
    const userTables = tables.filter(t => t.name.toLowerCase().includes('user'));
    console.log(`\nFound ${userTables.length} tables containing "user" in name:`);
    userTables.forEach(table => {
      console.log(`- ${table.name}`);
      
      // Examine the schema of each user-related table
      db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
        if (err) {
          console.error(`Error getting table structure for ${table.name}:`, err.message);
          return;
        }
        
        console.log(`  Columns in ${table.name}:`);
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type}, ${col.notnull ? 'NOT NULL' : 'NULL'})`);
        });
        console.log('---');
      });
    });
    
    // Look specifically for the 'users' table
    db.all(`PRAGMA table_info(users)`, [], (err, columns) => {
      if (err) {
        console.error(`Error: ${err.message}`);
        console.log("Table 'users' doesn't exist or cannot be accessed!");
      } else {
        console.log("\nFound table 'users' with structure:");
        columns.forEach(col => {
          console.log(`- ${col.name} (${col.type}, ${col.notnull ? 'NOT NULL' : 'NULL'})`);
        });
      }
      
      db.close();
    });
  });
});
