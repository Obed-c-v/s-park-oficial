require('dotenv').config();
const { query } = require('./src/config/db');

async function migrate() {
  try {
    console.log('Starting migration...');

    // 1. Alter table 'pacientes' to add new columns
    console.log('Altering table "pacientes"...');
    await query(`
      ALTER TABLE pacientes 
      ADD COLUMN IF NOT EXISTS racha_dias integer DEFAULT 3,
      ADD COLUMN IF NOT EXISTS puntos_bienestar integer DEFAULT 210,
      ADD COLUMN IF NOT EXISTS alergias text DEFAULT '',
      ADD COLUMN IF NOT EXISTS recetas text DEFAULT '';
    `);
    console.log('Columns added successfully to "pacientes"!');

    // 2. Ensure default exercises in 'ejercicios' table
    console.log('Seeding "ejercicios" table...');
    
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

    // We use ON CONFLICT or a SELECT check to avoid duplicates.
    // Let's check if the exercises exist by name.
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
      console.log('Exercises seeded successfully!');
    } else {
      console.log('Exercises already exist. Skipping seed.');
    }

    console.log('Migration finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
