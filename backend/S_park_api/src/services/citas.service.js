const { query } = require('../config/db');

/**
 * Create a new appointment.
 */
const createCita = async (pacienteId, medicoId, fechaHora, estado) => {
  const q = `
    INSERT INTO citas (paciente_id, medico_id, fecha_hora, estado)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await query(q, [pacienteId, medicoId, fechaHora, estado || 'PROGRAMADA']);
  return result.rows[0];
};

/**
 * Get appointments for a specific doctor.
 */
const getCitasByMedico = async (medicoId) => {
  const q = `
    SELECT c.*, p.nombre, p.apellido
    FROM citas c
    JOIN pacientes p ON c.paciente_id = p.id
    WHERE c.medico_id = $1
    ORDER BY c.fecha_hora ASC
  `;
  const result = await query(q, [medicoId]);
  return result.rows;
};

module.exports = {
  createCita,
  getCitasByMedico
};
