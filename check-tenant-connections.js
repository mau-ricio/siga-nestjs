const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Check the main database
console.log('Checking sharedDB.sqlite...');
const mainDb = new sqlite3.Database('./sharedDB.sqlite', (err) => {
  if (err) {
    console.error('Could not connect to sharedDB.sqlite:', err.message);
    return;
  }
  console.log('Connected to sharedDB.sqlite');
  
  // List tables
  mainDb.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
    if (err) {
      console.error('Error listing tables:', err.message);
      return;
    }
    
    console.log('Tables in sharedDB.sqlite:');
    console.log(tables);
    
    // Close main DB when done
    mainDb.close();
  });
});

// Print current directory for reference
console.log('Current directory:', process.cwd());

// List all SQLite files in the directory
console.log('Scanning for SQLite database files...');
fs.readdir('.', (err, files) => {
  if (err) {
    console.error('Error reading directory:', err.message);
    return;
  }
  
  const sqliteFiles = files.filter(file => file.endsWith('.sqlite'));
  console.log('SQLite files found:', sqliteFiles);
  
  // Check each SQLite file
  sqliteFiles.forEach(file => {
    if (file === 'sharedDB.sqlite') {
      return; // Already checked above
    }
    
    console.log(`\nChecking ${file}...`);
    const db = new sqlite3.Database(`./${file}`, (err) => {
      if (err) {
        console.error(`Could not connect to ${file}:`, err.message);
        return;
      }
      
      // List tables in this database
      db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
        if (err) {
          console.error(`Error listing tables in ${file}:`, err.message);
          db.close();
          return;
        }
        
        console.log(`Tables in ${file}:`);
        console.log(tables);
        
        // If users table exists, check its structure
        if (tables.some(t => t.name === 'users')) {
          db.all(`PRAGMA table_info(users)`, [], (err, columns) => {
            if (err) {
              console.error(`Error getting users table structure in ${file}:`, err.message);
            } else {
              console.log(`Users table structure in ${file}:`);
              console.log(columns);
            }
            db.close();
          });
        } else {
          db.close();
        }
      });
    });
  });
});
