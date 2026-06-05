/**
 * S-Park: Crear Admin de Pruebas
 * ================================
 * Inserta un usuario ADMIN directamente en la base de datos s_park.
 * 
 * Credenciales:
 *   Email:    admin.test@spark.com
 *   Password: AdminTest2025!
 *   Rol:      ADMIN
 * 
 * Uso: node create-admin-test.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'obed',
  database: process.env.DB_NAME     || 's_park',
  port:     parseInt(process.env.DB_PORT) || 5432,
});

const ADMIN_EMAIL    = 'admin.test@spark.com';
const ADMIN_PASSWORD = 'AdminTest2025!';

async function createAdmin() {
  const client = await pool.connect();
  try {
    console.log('🔧 Creando admin de pruebas en S-Park...');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');

    await client.query('BEGIN');

    // 1. Verificar si ya existe
    const existing = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  El admin ya existe. Actualizando contraseña...');
      const newHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await client.query(
        'UPDATE usuarios SET password_hash = $1, activo = TRUE WHERE email = $2',
        [newHash, ADMIN_EMAIL]
      );
      await client.query('COMMIT');
      console.log('✅ Contraseña actualizada correctamente.');
      return;
    }

    // 2. Crear usuario
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const userResult = await client.query(
      `INSERT INTO usuarios (email, password_hash, email_verificado, primer_acceso, activo)
       VALUES ($1, $2, TRUE, FALSE, TRUE)
       RETURNING id`,
      [ADMIN_EMAIL, passwordHash]
    );
    const userId = userResult.rows[0].id;
    console.log(`   ✅ Usuario creado con ID: ${userId}`);

    // 3. Obtener o crear rol ADMIN
    let roleResult = await client.query(
      "SELECT id FROM roles WHERE nombre = 'ADMIN'"
    );

    if (roleResult.rows.length === 0) {
      // Si no existe el rol, crearlo
      roleResult = await client.query(
        "INSERT INTO roles (nombre) VALUES ('ADMIN') RETURNING id"
      );
      console.log('   ✅ Rol ADMIN creado.');
    }

    const roleId = roleResult.rows[0].id;

    // 4. Asignar rol ADMIN al usuario
    await client.query(
      'INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ($1, $2)',
      [userId, roleId]
    );
    console.log(`   ✅ Rol ADMIN asignado.`);

    await client.query('COMMIT');

    console.log('');
    console.log('🎉 ¡Admin de pruebas creado exitosamente!');
    console.log('');
    console.log('   📋 Credenciales:');
    console.log(`      Email:    ${ADMIN_EMAIL}`);
    console.log(`      Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('   🌐 Accede al panel médico:');
    console.log('      http://localhost:4200  (o IP local en red)');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al crear admin:', error.message);
    
    if (error.message.includes('usuario_rol')) {
      console.error('   Posible causa: La tabla usuario_rol no existe o tiene restricciones.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin();
