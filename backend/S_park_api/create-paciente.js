const { query } = require('./src/config/db');
const { hashPassword } = require('./src/utils/hash');

async function run() {
  const email = 'paciente@spark.com';
  const password = 'paciente123';
  const nombre = 'Juan';
  const apellido = 'Pérez';
  const fechaNacimiento = '1975-05-15';
  const genero = 'MASCULINO';
  const telefono = '5551234567';

  try {
    console.log('🔄 Inicializando creación de Paciente de Prueba...');

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

    // 2. Comprobar si el usuario ya existe
    const userCheck = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
    let userId;

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      console.log(`ℹ️ El usuario ${email} ya existe en la base de datos. Actualizando contraseña...`);
      const hashed = await hashPassword(password);
      await query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hashed, userId]);
    } else {
      console.log(`➕ Creando nuevo usuario paciente: ${email}...`);
      const hashed = await hashPassword(password);
      const userRes = await query(
        'INSERT INTO usuarios (email, password_hash, email_verificado, primer_acceso) VALUES ($1, $2, TRUE, FALSE) RETURNING id',
        [email, hashed]
      );
      userId = userRes.rows[0].id;
      console.log('✅ Usuario creado.');
    }

    // 3. Asignar rol PACIENTE
    const userRolCheck = await query('SELECT 1 FROM usuario_rol WHERE usuario_id = $1 AND rol_id = $2', [
      userId,
      roleMap['PACIENTE'],
    ]);

    if (userRolCheck.rows.length === 0) {
      console.log('➕ Asignando rol PACIENTE al usuario...');
      await query('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ($1, $2)', [userId, roleMap['PACIENTE']]);
      console.log('✅ Rol PACIENTE asignado.');
    }

    // 4. Crear o actualizar perfil en la tabla de pacientes
    const pacienteCheck = await query('SELECT id FROM pacientes WHERE usuario_id = $1', [userId]);
    let pacienteId;

    if (pacienteCheck.rows.length > 0) {
      pacienteId = pacienteCheck.rows[0].id;
      console.log('ℹ️ El perfil del paciente ya existe. Actualizando datos...');
      await query(
        'UPDATE pacientes SET nombre = $1, apellido = $2, fecha_nacimiento = $3, telefono = $4, email = $5, updated_at = NOW() WHERE id = $6',
        [nombre, apellido, fechaNacimiento, telefono, email, pacienteId]
      );
    } else {
      console.log('➕ Creando perfil de paciente...');
      const pacRes = await query(
        'INSERT INTO pacientes (usuario_id, nombre, apellido, fecha_nacimiento, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), 0, 0) RETURNING id',
        [userId, nombre, apellido, fechaNacimiento, telefono, email]
      );
      pacienteId = pacRes.rows[0].id;
      console.log('✅ Perfil de paciente creado.');
    }

    // 5. Crear expediente clínico si no existe
    const expCheck = await query('SELECT id FROM expedientes WHERE paciente_id = $1', [pacienteId]);
    if (expCheck.rows.length === 0) {
      console.log('➕ Abriendo expediente clínico...');
      await query(
        'INSERT INTO expedientes (paciente_id, fecha_apertura, estado, created_at, updated_at) VALUES ($1, CURRENT_DATE, $2, NOW(), NOW())',
        [pacienteId, 'ACTIVO']
      );
      console.log('✅ Expediente clínico abierto.');
    }

    console.log('\n==================================================');
    console.log(' 🎉 ¡PACIENTE DE PRUEBA REGISTRADO CORRECTAMENTE! ');
    console.log('==================================================');
    console.log(` 📧 Correo:     ${email}`);
    console.log(` 🔑 Contraseña: ${password}`);
    console.log(` 👤 Nombre:     ${nombre} ${apellido}`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el paciente:', error);
    process.exit(1);
  }
}

run();
