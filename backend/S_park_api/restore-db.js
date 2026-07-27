require('dotenv').config();
const { query, pool } = require('./src/config/db');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('./src/utils/hash');

async function run() {
  console.log('🏁 INICIANDO RESTAURACIÓN AUTOMÁTICA DE LA BASE DE DATOS...');
  
  // 1. Localizar y leer el archivo SQL oficial en la raíz
  const sqlPath = path.join(__dirname, '..', '..', 's-park-oficial.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ No se encontró el archivo SQL en: ${sqlPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  try {
    // 2. Limpiar y estructurar las sentencias SQL
    console.log('🔄 Ejecutando estructura s-park-oficial.sql...');
    // Ejecutar el script SQL completo en bloque
    await query(sqlContent);
    console.log('✅ Esquema DDL ejecutado correctamente (Tablas creadas).');

    // 3. Sembrar biomarcadores por defecto
    console.log('🌱 Sembrando biomarcadores...');
    const biomarkers = [
      { id: 1, nombre: 'Jitter', unidad: '%', min: 0.0, max: 1.5 },
      { id: 2, nombre: 'Shimmer', unidad: '%', min: 0.0, max: 5.0 },
      { id: 3, nombre: 'HNR', unidad: 'dB', min: 0.0, max: 50.0 }
    ];
    for (const b of biomarkers) {
      await query(`
        INSERT INTO biomarcadores (id, nombre, unidad, rango_min, rango_max)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE 
        SET nombre = EXCLUDED.nombre, unidad = EXCLUDED.unidad, rango_min = EXCLUDED.rango_min, rango_max = EXCLUDED.rango_max;
      `, [b.id, b.nombre, b.unidad, b.min, b.max]);
    }
    console.log('✅ Biomarcadores sembrados.');

    // 4. Ejecutar alteraciones de pacientes y sembrado de ejercicios
    console.log('⚙️ Ejecutando alteraciones y sembrado de ejercicios...');
    await query(`
      ALTER TABLE pacientes 
      ADD COLUMN IF NOT EXISTS racha_dias integer DEFAULT 3,
      ADD COLUMN IF NOT EXISTS puntos_bienestar integer DEFAULT 210,
      ADD COLUMN IF NOT EXISTS alergias text DEFAULT '',
      ADD COLUMN IF NOT EXISTS recetas text DEFAULT '';
    `);

    const cervicalDesc = JSON.stringify({
      subtitle: 'Movilidad cervical suave · Alivia rigidez en cuello',
      duration: '5 min',
      hint: 'Movimiento lento, sin dolor',
      target: 'Aflojar suavemente la musculatura del cuello y mejorar la movilidad cervical sin forzar.',
      steps: [
        'Siéntate con la espalda apoyada firmemente y los pies planos en el suelo.',
        'Lleva la barbilla hacia el pecho lentamente y respira profundo.',
        'Despacio, dibuja un medio círculo llevando la cabeza hacia tu hombro izquierdo y luego de regreso hacia el derecho.',
        'Mantén un ritmo pausado y respira tranquilo mientras te mueves.',
        'Haz una pausa de 10 segundos al finalizar cada serie antes de continuar.'
      ],
      precautions: 'Si aparece dolor, mareo o visión borrosa, detén el ejercicio inmediatamente. No hagas giros de 360 grados ni tirones bruscos.'
    });

    const hombrosDesc = JSON.stringify({
      subtitle: 'Movilidad de hombros · Reduce rigidez superior',
      duration: '6 min',
      hint: 'Hombros relajados, ritmo pausado',
      target: 'Liberar tensión acumulada en la articulación del hombro y la parte superior de la espalda.',
      steps: [
        'Colócate erguido en una silla cómoda con los brazos relajados a los lados.',
        'Inhala aire y sube ambos hombros de forma controlada hacia tus orejas.',
        'Exhala suavemente mientras llevas los hombros hacia atrás y abajo en un movimiento circular.',
        'Mantén el cuello recto y evita tensar la mandíbula al subir.',
        'Realiza de 5 a 8 giros suaves por cada serie.'
      ],
      precautions: 'Evita movimientos rápidos o forzar el rango de movimiento si sientes pinchazos o molestias agudas en el manguito rotador.'
    });

    const manosDesc = JSON.stringify({
      subtitle: 'Coordinación fina · Agilidad en dedos',
      duration: '4 min',
      hint: 'Movimiento fluido y muy consciente',
      target: 'Estimular la circulación, la motricidad fina y disminuir la rigidez en manos y dedos.',
      steps: [
        'Extiende ambos brazos al frente a la altura de tu pecho con las palmas abiertas.',
        'Separa los dedos lo más posible sintiendo un estiramiento agradable y sostén por 3 segundos.',
        'Cierra los puños suavemente, abrazando el pulgar sin apretar con demasiada fuerza.',
        'Abre las manos nuevamente y toca consecutivamente la yema de cada dedo con la yema del pulgar.',
        'Alterna el orden de los toques para desafiar la coordinación cerebral.'
      ],
      precautions: 'Si sientes fatiga muscular en los antebrazos, haz pausas más prolongadas. No forces las articulaciones si hay dolor.'
    });

    const checkRes = await query('SELECT id FROM ejercicios WHERE nombre = $1', ['Círculos suaves de cuello sentad@']);
    if (checkRes.rows.length === 0) {
      await query(`
        INSERT INTO ejercicios (nombre, descripcion, nivel, created_at, updated_at)
        VALUES 
          ($1, $2, 'Básico', NOW(), NOW()),
          ($3, $4, 'Básico', NOW(), NOW()),
          ($5, $6, 'Intermedio', NOW(), NOW())
      `, [
        'Círculos suaves de cuello sentad@', cervicalDesc,
        'Elevación y rotación suave de hombros', hombrosDesc,
        'Apertura y cierre de manos con toques de dedos', manosDesc
      ]);
      console.log('✅ Ejercicios clínicos sembrados.');
    }

    // 5. Asegurar roles
    const roles = ['ADMIN', 'MEDICO', 'PACIENTE'];
    const roleMap = {};
    for (const r of roles) {
      const roleCheck = await query('SELECT id FROM roles WHERE nombre = $1', [r]);
      if (roleCheck.rows.length === 0) {
        const res = await query('INSERT INTO roles (nombre) VALUES ($1) RETURNING id', [r]);
        roleMap[r] = res.rows[0].id;
      } else {
        roleMap[r] = roleCheck.rows[0].id;
      }
    }
    console.log('✅ Roles verificados.');

    // 6. Crear Administrador por defecto
    const adminEmail = 'admin@spark.com';
    const adminPass = 'admin123';
    const adminCheck = await query('SELECT id FROM usuarios WHERE email = $1', [adminEmail]);
    let adminUserId;
    if (adminCheck.rows.length > 0) {
      adminUserId = adminCheck.rows[0].id;
      const hashed = await hashPassword(adminPass);
      await query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hashed, adminUserId]);
    } else {
      const hashed = await hashPassword(adminPass);
      const res = await query(
        'INSERT INTO usuarios (email, password_hash, email_verificado, primer_acceso) VALUES ($1, $2, TRUE, FALSE) RETURNING id',
        [adminEmail, hashed]
      );
      adminUserId = res.rows[0].id;
    }
    const adminRolCheck = await query('SELECT 1 FROM usuario_rol WHERE usuario_id = $1 AND rol_id = $2', [adminUserId, roleMap['ADMIN']]);
    if (adminRolCheck.rows.length === 0) {
      await query('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ($1, $2)', [adminUserId, roleMap['ADMIN']]);
    }
    console.log('✅ Administrador registrado.');

    // 7. Crear Paciente por defecto
    const pacEmail = 'paciente@spark.com';
    const pacPass = 'paciente123';
    const pacCheck = await query('SELECT id FROM usuarios WHERE email = $1', [pacEmail]);
    let pacUserId;
    if (pacCheck.rows.length > 0) {
      pacUserId = pacCheck.rows[0].id;
      const hashed = await hashPassword(pacPass);
      await query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hashed, pacUserId]);
    } else {
      const hashed = await hashPassword(pacPass);
      const res = await query(
        'INSERT INTO usuarios (email, password_hash, email_verificado, primer_acceso) VALUES ($1, $2, TRUE, FALSE) RETURNING id',
        [pacEmail, hashed]
      );
      pacUserId = res.rows[0].id;
    }
    const pacRolCheck = await query('SELECT 1 FROM usuario_rol WHERE usuario_id = $1 AND rol_id = $2', [pacUserId, roleMap['PACIENTE']]);
    if (pacRolCheck.rows.length === 0) {
      await query('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ($1, $2)', [pacUserId, roleMap['PACIENTE']]);
    }

    const pacProfileCheck = await query('SELECT id FROM pacientes WHERE usuario_id = $1', [pacUserId]);
    let pacProfileId;
    if (pacProfileCheck.rows.length > 0) {
      pacProfileId = pacProfileCheck.rows[0].id;
      await query(
        'UPDATE pacientes SET nombre = $1, apellido = $2, fecha_nacimiento = $3, telefono = $4, email = $5, updated_at = NOW() WHERE id = $6',
        ['Juan', 'Pérez', '1975-05-15', '5551234567', pacEmail, pacProfileId]
      );
    } else {
      const res = await query(
        'INSERT INTO pacientes (usuario_id, nombre, apellido, fecha_nacimiento, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), 0, 0) RETURNING id',
        [pacUserId, 'Juan', 'Pérez', '1975-05-15', '5551234567', pacEmail]
      );
      pacProfileId = res.rows[0].id;
    }

    const expCheck = await query('SELECT id FROM expedientes WHERE paciente_id = $1', [pacProfileId]);
    if (expCheck.rows.length === 0) {
      await query(
        'INSERT INTO expedientes (paciente_id, fecha_apertura, estado, created_at, updated_at) VALUES ($1, CURRENT_DATE, $2, NOW(), NOW())',
        [pacProfileId, 'ACTIVO']
      );
    }
    console.log('✅ Paciente de prueba registrado.');

    console.log('\n========================================================');
    console.log(' 🎉 ¡BASE DE DATOS INICIALIZADA Y RESTAURADA CON ÉXITO! ');
    console.log('========================================================');
    console.log(' Los siguientes accesos han sido asegurados:');
    console.log(` 🔑 Admin:    ${adminEmail}  /  contraseña: ${adminPass}`);
    console.log(` 🔑 Paciente: ${pacEmail}  /  contraseña: ${pacPass}`);
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el proceso de restauración:', error);
    process.exit(1);
  }
}

run();
