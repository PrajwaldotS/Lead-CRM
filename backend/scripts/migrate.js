const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Load the DB setup without db name, so we can connect to the postgres default DB and create leadcrm if needed
const initPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: 'postgres',
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function runMigrations() {
  console.log('🔄 Checking database existence...');
  
  // 1. Check & Create Database if needed
  try {
    const dbName = process.env.DB_NAME;
    const res = await initPool.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await initPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created successfully.`);
    } else {
      console.log(`✅ Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error('Failed checking/creating database:', err.message);
    process.exit(1);
  } finally {
    await initPool.end();
  }

  // 2. Run schema and seed SQL
  try {
    console.log('🔄 Running initial schema migration...');
    const schemaSqlPath = path.join(__dirname, '../migrations/001_init.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Schema migration successful.');

    console.log('🔄 Running lead lists migration...');
    const listsSqlPath = path.join(__dirname, '../migrations/003_lead_lists.sql');
    const listsSql = fs.readFileSync(listsSqlPath, 'utf8');
    await pool.query(listsSql);
    console.log('✅ Lead lists migration successful.');

    console.log('🔄 Running seed data...');
    const seedSqlPath = path.join(__dirname, '../migrations/002_seed.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    await pool.query(seedSql);
    console.log('✅ Seed data inserted successfully.');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
