const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sharedDB.sqlite');

console.log('Connecting to sharedDB.sqlite...');

// Check tables in the database
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Tables found in database:');
    console.log(tables);
  }
  
  // Check specifically for users table
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, users) => {
    if (err) {
      console.error('Error checking for users table:', err.message);
    } else {
      if (users.length > 0) {
        console.log('Users table exists');
        
        // Check structure of users table
        db.all("PRAGMA table_info(users)", (err, cols) => {
          if (err) {
            console.error('Error getting users table structure:', err.message);
          } else {
            console.log('Users table structure:');
            console.log(cols);
          }
          db.close();
        });
      } else {
        console.log('Users table does NOT exist');
        db.close();
      }
    }
  });
});
