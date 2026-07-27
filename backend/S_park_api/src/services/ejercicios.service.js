const { query } = require('../config/db');

/**
 * Get all available exercises.
 */
const getAllEjercicios = async () => {
  const res = await query('SELECT * FROM ejercicios ORDER BY id ASC');
  return res.rows;
};

/**
 * Mark a routine series or routine as completed, updating points and streak.
 */
const completarRutina = async (userId) => {
  // Get current points and streak
  const getRes = await query(
    'SELECT id, puntos_bienestar, racha_dias FROM pacientes WHERE usuario_id = $1',
    [userId]
  );

  if (getRes.rows.length === 0) {
    throw { statusCode: 404, message: 'Patient not found for this user' };
  }

  const { id: pacienteId, puntos_bienestar, racha_dias } = getRes.rows[0];

  const nuevosPuntos = (puntos_bienestar || 0) + 70;
  const nuevaRacha = (racha_dias || 0) + 1;

  const updateRes = await query(
    `UPDATE pacientes 
     SET puntos_bienestar = $1, racha_dias = $2 
     WHERE id = $3 
     RETURNING puntos_bienestar, racha_dias`,
    [nuevosPuntos, nuevaRacha, pacienteId]
  );

  // Optional: insert into paciente_ejercicio for logging completion history
  // Let's check if we have any exercises, we can just insert a completion log.
  // We don't strictly need to do it if we are just completing "today's routine", 
  // but it's good practice. We'll insert a row.
  try {
    await query(
      `INSERT INTO paciente_ejercicio (paciente_id, fecha_asignacion, estado)
       VALUES ($1, CURRENT_DATE, 'COMPLETADO')`,
      [pacienteId]
    );
  } catch (err) {
    console.error('Error logging exercise completion history:', err.message);
  }

  return updateRes.rows[0];
};

module.exports = {
  getAllEjercicios,
  completarRutina
};
