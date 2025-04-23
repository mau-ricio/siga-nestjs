// This script reverts the last migration for all tenant databases
const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

/**
 * This function reverts the last migration for a tenant database
 * @param {Object} database - The database configuration object
 * @returns {Promise<void>}
 */
async function revertMigrationForTenant(database) {
  console.log(`Reverting last migration for tenant database: ${database.name} ${database.url}`);
  
  // Handle database connection options differently based on type
  let connectionOptions = {};
  
  if (database.type === 'sqlite') {
    // For SQLite, we need to properly extract the file path
    let dbPath = database.url.replace(/^sqlite:\/\//, '');
    
    // If it starts with ./ or ../ it's a relative path
    if (dbPath.startsWith('./') || dbPath.startsWith('../')) {
      dbPath = path.resolve(process.cwd(), dbPath);
    }
    
    console.log(`Using SQLite database file at: ${dbPath}`);
    
    // Use database property instead of url for SQLite
    connectionOptions = {
      type: 'sqlite',
      database: dbPath,
    };
  } else {
    // For other databases like PostgreSQL
    connectionOptions = {
      type: database.type,
      url: database.url,
    };
  };
  
  // Get the base tenant DataSource from the config file
  const tenantConfigPath = path.resolve(process.cwd(), 'typeorm-tenant.config.ts');
  
  // Load tenant configuration using require - for JavaScript
  let tenantConfig;
  if (fs.existsSync(tenantConfigPath)) {
    // For TypeScript environment, use ts-node to load the config
    require('ts-node/register');
    tenantConfig = require(tenantConfigPath).default;
  } else {
    // For compiled JavaScript in production
    tenantConfig = require(path.resolve(process.cwd(), 'dist', 'typeorm-tenant.config.js')).default;
  }
  
  // Create a tenant-specific DataSource by cloning the config and updating connection details
  const tenantDataSource = new DataSource({
    ...tenantConfig.options,
    ...connectionOptions, // Use our properly configured connection options
  });
  
  try {
    // Initialize connection
    await tenantDataSource.initialize();
    console.log(`Connected to tenant database: ${database.name}`);
    
    // Revert last migration
    await tenantDataSource.undoLastMigration();
    console.log(`Last migration reverted for tenant database: ${database.name}`);
    
    // Close connection
    await tenantDataSource.destroy();
  } catch (error) {
    console.error(`Error reverting migration for tenant database ${database.name}:`, error);
    process.exit(1);
  }
}

/**
 * Main function to revert last migration for all tenant databases
 */
async function revertMigrationForAllTenants() {
  // Create admin DataSource to fetch database configurations
  const adminDataSource = new DataSource({
    ...(process.env.NODE_ENV === 'production'
      ? {
          type: process.env.ADMINDBTYPE,
          url: process.env.ADMINDBURL,
        }
      : {
          type: 'sqlite',
          database: path.resolve(process.cwd(), 'admin.sqlite'),
        }),
    entities: [path.join(__dirname, '../../dist/admin/**/*.entity.js')],
  });

  try {
    // Initialize admin connection
    await adminDataSource.initialize();
    console.log('Connected to admin database to fetch tenant databases');
    
    // Use a raw SQL query to fetch databases instead of the repository
    const databases = await adminDataSource.query('SELECT * FROM databases WHERE deletedAt IS NULL');
    
    console.log(`Found ${databases.length} tenant databases`);
    
    // Revert last migration for each tenant database
    for (const database of databases) {
      await revertMigrationForTenant(database);
    }
    
    // Close admin connection
    await adminDataSource.destroy();
    console.log('Last migration reverted for all tenant databases successfully');
  } catch (error) {
    console.error('Error reverting tenant migrations:', error);
    process.exit(1);
  }
}

// Run the migration revert process
revertMigrationForAllTenants();
