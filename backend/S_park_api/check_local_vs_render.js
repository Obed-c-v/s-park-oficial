require('dotenv').config({ path: './.env' });
const { Pool } = require('pg');

// Local Pool
const localPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'obed',
  database: process.env.DB_NAME || 's_park'
});

// Render Pool (using the connection string provided in previous instructions)
const renderConnectionString = 'postgresql://spark_db_8zi1_user:geiyzvd8R55JShBESnpiQGtra8lEUtkX@dpg-d8p0m4gjs32c7389qpc0-a.oregon-postgres.render.com/spark_db_8zi1';
const renderPool = new Pool({
  connectionString: renderConnectionString,
  ssl: { rejectUnauthorized: false }
});

async function compare() {
  try {
    console.log('--- LATEST LOCAL BIOMARKERS (JITTER) ---');
    const localRes = await localPool.query(`
      SELECT rb.id, rb.paciente_id, rb.valor, rb.fecha_registro, rb.resultado_ia->>'probabilidad' as prob, rb.resultado_ia->>'riesgo' as riesgo
      FROM registros_biomarcador rb
      WHERE rb.biomarcador_id = 1
      ORDER BY rb.fecha_registro DESC LIMIT 3
    `);
    console.table(localRes.rows);

    console.log('\n--- LATEST RENDER BIOMARKERS (JITTER) ---');
    const renderRes = await renderPool.query(`
      SELECT rb.id, rb.paciente_id, rb.valor, rb.fecha_registro, rb.resultado_ia->>'probabilidad' as prob, rb.resultado_ia->>'riesgo' as riesgo
      FROM registros_biomarcador rb
      WHERE rb.biomarcador_id = 1
      ORDER BY rb.fecha_registro DESC LIMIT 3
    `);
    console.table(renderRes.rows);

    await localPool.end();
    await renderPool.end();
  } catch (err) {
    console.error('Comparison error:', err.message);
  }
}

compare();
