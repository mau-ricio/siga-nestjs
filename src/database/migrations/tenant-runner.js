// This script runs migrations for all tenant databases
const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

// Register ts-node to allow importing TypeScript files
require('ts-node/register');

/**
 * This function runs migrations for a tenant database
 * @param {Object} database - The database configuration object
 * @returns {Promise<void>}
 */
async function runMigrationsForTenant(database) {
  console.log(`Running migrations for tenant database: ${database.name} ${database.url}`);
  
  
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
  }
  
  // Get the base tenant DataSource from the config file
  const tenantConfigPath = path.resolve(process.cwd(), 'typeorm-tenant.config.ts');
  
  // Load tenant configuration
  let tenantConfig;
  if (fs.existsSync(tenantConfigPath)) {
    tenantConfig = require(tenantConfigPath).default;
  } else {
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
    
    // Run migrations
    await tenantDataSource.runMigrations();
    console.log(`Migrations completed for tenant database: ${database.name}`);
    
    // Close connection
    await tenantDataSource.destroy();
  } catch (error) {
    console.error(`Error running migrations for tenant database ${database.name}:`, error);
    process.exit(1);
  }
}

/**
 * Main function to run migrations for all tenant databases
 */
async function runMigrationsForAllTenants() {
  // Define the Database entity class manually since we're outside the NestJS context
  const DatabaseEntity = class {
    constructor(id, name, type, url, createdAt, updatedAt, deletedAt) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.url = url;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
      this.deletedAt = deletedAt;
    }
  };
  
  // Create admin DataSource to fetch database configurations with explicit entity definition
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
    // Define the entity metadata manually
    entities: [],
    synchronize: false,
    logging: true,
  });

  try {
    // Initialize admin connection
    await adminDataSource.initialize();
    console.log('Connected to admin database to fetch tenant databases');
    
    // Use a raw SQL query to fetch databases instead of the repository
    const databases = await adminDataSource.query('SELECT * FROM databases WHERE deletedAt IS NULL');
    
    console.log(`Found ${databases.length} tenant databases`);
    
    // Run migrations for each tenant database
    for (const database of databases) {
      await runMigrationsForTenant(database);
    }
    
    // Close admin connection
    await adminDataSource.destroy();
    console.log('All tenant migrations completed successfully');
  } catch (error) {
    console.error('Error running tenant migrations:', error);
    process.exit(1);
  }
}

// Run the migration process
runMigrationsForAllTenants();
