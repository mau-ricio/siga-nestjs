// This script runs migrations for all tenant databases
const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

/**
 * This function runs migrations for a tenant database
 * @param {Object} database - The database configuration object
 * @returns {Promise<void>}
 */
async function runMigrationsForTenant(database) {
  console.log(`Running migrations for tenant database: ${database.name}`);
  
  // Create connection options based on database type
  const connectionOptions = {
    type: database.type,
    url: database.url,
    synchronize: false,
    logging: true,
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
    type: database.type,
    url: database.url,
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
    
    // Fetch all active tenant databases
    const databases = await adminDataSource.manager.getRepository('databases').find({
      where: { deletedAt: null },
    });
    
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
