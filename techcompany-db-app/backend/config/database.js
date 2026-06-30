const sql = require('mssql');

// Database configuration - UPDATE THESE SETTINGS FOR YOUR SQL SERVER
const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',           // Your SQL Server name or IP
  database: process.env.DB_NAME || 'TechCompanyDB',       // Database name
  user: process.env.DB_USER || 'sa',                      // SQL Server username
  password: process.env.DB_PASSWORD || 'YourPassword123', // SQL Server password
  options: {
    encrypt: true,                                        // Use encryption
    trustServerCertificate: true,                         // Trust self-signed certs (dev only)
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Create connection pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

// Handle connection errors
pool.on('error', err => {
  console.error('SQL Pool Error:', err);
});

// Test connection function
async function testConnection() {
  try {
    await poolConnect;
    console.log('✅ Connected to SQL Server successfully!');
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Server: ${dbConfig.server}`);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('\n🔧 To fix connection issues:');
    console.log('   1. Update DB_SERVER in .env file or config/database.js');
    console.log('   2. Ensure SQL Server is running');
    console.log('   3. Check username and password');
    console.log('   4. Enable TCP/IP in SQL Server Configuration Manager');
    return false;
  }
}

module.exports = {
  sql,
  pool,
  poolConnect,
  testConnection,
  dbConfig
};