require('dotenv').config();
const { pool } = require('./src/config/db');

async function check() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', tablesRes.rows.map(r => r.table_name));
    
    for (const table of tablesRes.rows.map(r => r.table_name)) {
      const colsRes = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      console.log(`\nTable: ${table}`);
      console.table(colsRes.rows);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
