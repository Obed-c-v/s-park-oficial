const { query } = require('./src/config/db');
const { hashPassword } = require('./src/utils/hash');

async function run() {
  const email = 'admin@spark.com';
  const password = 'admin123';

  try {
    console.log('🔄 Inicializando creación de Administrador...');

    // 1. Asegurar la existencia de los roles principales
    const roles = ['ADMIN', 'MEDICO', 'PACIENTE'];
    const roleMap = {};

    for (const roleName of roles) {
      const roleCheck = await query('SELECT id FROM roles WHERE nombre = $1', [roleName]);
      if (roleCheck.rows.length === 0) {
        console.log(`➕ Creando rol: ${roleName}...`);
        const res = await query('INSERT INTO roles (nombre) VALUES ($1) RETURNING id', [roleName]);
        roleMap[roleName] = res.rows[0].id;
      } else {
        roleMap[roleName] = roleCheck.rows[0].id;
      }
    }

    // 2. Comprobar si el usuario admin ya existe
    const userCheck = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
    let userId;

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      console.log(`ℹ️ El usuario ${email} ya existe. Actualizando contraseña...`);
      const hashed = await hashPassword(password);
      await query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hashed, userId]);
      console.log('✅ Contraseña actualizada correctamente.');
    } else {
      console.log(`➕ Creando nuevo usuario: ${email}...`);
      const hashed = await hashPassword(password);
      const userRes = await query(
        'INSERT INTO usuarios (email, password_hash, email_verificado, primer_acceso) VALUES ($1, $2, TRUE, FALSE) RETURNING id',
        [email, hashed]
      );
      userId = userRes.rows[0].id;
      console.log('✅ Usuario creado.');
    }

    // 3. Verificar si el usuario ya tiene el rol ADMIN asignado
    const userRolCheck = await query('SELECT 1 FROM usuario_rol WHERE usuario_id = $1 AND rol_id = $2', [
      userId,
      roleMap['ADMIN'],
    ]);

    if (userRolCheck.rows.length === 0) {
      console.log('➕ Asignando rol ADMIN al usuario...');
      await query('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ($1, $2)', [userId, roleMap['ADMIN']]);
      console.log('✅ Rol ADMIN asignado.');
    } else {
      console.log('ℹ️ El usuario ya cuenta con el rol ADMIN.');
    }

    console.log('\n==================================================');
    console.log(' 🎉 ¡ADMINISTRADOR LISTO PARA INICIAR SESIÓN! ');
    console.log('==================================================');
    console.log(` 📧 Correo:     ${email}`);
    console.log(` 🔑 Contraseña: ${password}`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
    process.exit(1);
  }
}

run();
