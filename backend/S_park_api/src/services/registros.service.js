const { query } = require('../config/db');
const axios = require('axios');

/**
 * Create a new biomarker record (AI result).
 */
const createRegistro = async (pacienteId, medicoId, biomarcadorId, valor) => {
  const q = `
    INSERT INTO registros_biomarcador (paciente_id, medico_id, biomarcador_id, valor)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await query(q, [pacienteId, medicoId, biomarcadorId, valor]);
  return result.rows[0];
};

/**
 * Get biomarker records for a patient.
 */
const getRegistrosByPaciente = async (pacienteId) => {
  const q = `
    SELECT r.*, b.nombre, b.unidad, b.rango_min, b.rango_max
    FROM registros_biomarcador r
    JOIN biomarcadores b ON r.biomarcador_id = b.id
    WHERE r.paciente_id = $1
    ORDER BY r.fecha_registro DESC
  `;
  const result = await query(q, [pacienteId]);
  return result.rows;
};

/**
 * Get intelligent alerts for doctor's patients.
 */
const getAlertas = async (medicoId, rol) => {
  let q = `
    SELECT 
      p.nombre || ' ' || p.apellido as paciente,
      CASE 
        WHEN rb.valor > b.rango_max THEN 'ALTO'
        ELSE 'NORMAL'
      END as riesgo,
      rb.fecha_registro as ultima_prueba,
      EXISTS (SELECT 1 FROM citas WHERE paciente_id = p.id AND fecha_hora > CURRENT_TIMESTAMP) as tiene_cita,
      CASE 
        WHEN rb.valor > b.rango_max THEN 'Nivel de biomarcador fuera de rango'
        WHEN rb.fecha_registro < CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 'Falta de seguimiento (más de 30 días)'
        ELSE 'Estado estable'
      END as mensaje
    FROM pacientes p
    JOIN expedientes e ON p.id = e.paciente_id
    LEFT JOIN (
      SELECT DISTINCT ON (paciente_id) * FROM registros_biomarcador ORDER BY paciente_id, fecha_registro DESC
    ) rb ON p.id = rb.paciente_id
    LEFT JOIN biomarcadores b ON rb.biomarcador_id = b.id
  `;
  
  const params = [];
  if (rol !== 'ADMIN') {
    q += ` WHERE e.medico_responsable_id = $1`;
    params.push(medicoId);
  }

  const result = await query(q, params);
  return result.rows;
};

/**
 * Get dashboard stats for doctor.
 */
const getDashboardStats = async (medicoId, rol) => {
  let statsQ = `
    SELECT 
      COUNT(DISTINCT p.id) as total_pacientes,
      COUNT(DISTINCT CASE WHEN rb.valor > b.rango_max THEN p.id END) as riesgo_alto,
      COUNT(rb.id) as pruebas_realizadas,
      MAX(rb.fecha_registro) as ultima_prueba
    FROM pacientes p
    JOIN expedientes e ON p.id = e.paciente_id
    LEFT JOIN registros_biomarcador rb ON p.id = rb.paciente_id
    LEFT JOIN biomarcadores b ON rb.biomarcador_id = b.id
  `;

  const params = [];
  if (rol !== 'ADMIN') {
    statsQ += ` WHERE e.medico_responsable_id = $1`;
    params.push(medicoId);
  }

  const result = await query(statsQ, params);
  const stats = result.rows[0] || {};

  // Actividad Reciente (Últimas 5 pruebas de voz de pacientes asociados, agrupado por la prueba Jitter biomarcador_id=1)
  let actQ = `
    SELECT 
      p.apellido || ', ' || p.nombre as paciente,
      rb.fecha_registro as fecha,
      rb.id as id_prueba,
      rb.resultado_ia->>'riesgo' as riesgo
    FROM registros_biomarcador rb
    JOIN pacientes p ON rb.paciente_id = p.id
    JOIN expedientes e ON p.id = e.paciente_id
    WHERE rb.biomarcador_id = 1
  `;
  
  const actParams = [];
  if (rol !== 'ADMIN') {
    actQ += ` AND e.medico_responsable_id = $1`;
    actParams.push(medicoId);
  }
  
  actQ += ` ORDER BY rb.fecha_registro DESC LIMIT 5`;
  
  const actResult = await query(actQ, actParams);
  stats.actividad_reciente = actResult.rows;

  return stats;
};

const getMlUrl = () => {
  let url = process.env.ML_API_URL || process.env.FLASK_API_URL || '';
  if (!url) {
    url = 'https://spark-ia.onrender.com';
  }
  // Si viene solo el host (ej: spark-ia-xxxx.onrender.com o spark-ia)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.')) {
      url = `https://${url}`;
    } else {
      url = `http://${url}:10000`;
    }
  }
  if (url.includes('onrender.com') && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  return url.replace(/\/+$/, '');
};

const createRegistroVoz = async (pacienteId, audioBase64, explicitMedicoId = null) => {
  // 1. Enviar audio al microservicio Flask
  const baseUrl = getMlUrl();
  const flaskUrl = `${baseUrl}/api/predict_audio`;
  console.log(`🤖 [ML IA] Llamando a microservicio de IA en: ${flaskUrl}`);

  let data;
  try {
    const response = await axios.post(flaskUrl, { audio: audioBase64 }, {
      timeout: 60000 // 60 segundos máximo (para permitir arranque de servidor en Render)
    });
    data = response.data;
  } catch (flaskErr) {
    // Si Render estaba suspendido por inactividad (cold-start / 429 / 502 / 504 / timeout), reintentar tras despertar
    if (
      flaskErr.response?.status === 429 || 
      flaskErr.response?.status === 502 || 
      flaskErr.response?.status === 504 || 
      flaskErr.code === 'ECONNRESET' || 
      flaskErr.code === 'ECONNABORTED' || 
      flaskErr.message?.includes('timeout')
    ) {
      try {
        console.log('⚠️ Render cold-start o timeout detectado. Reintentando en 3 segundos...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        const retryResponse = await axios.post(flaskUrl, { audio: audioBase64 }, { timeout: 60000 });
        data = retryResponse.data;
      } catch (retryErr) {
        throw { 
          statusCode: 502, 
          message: 'El servicio de IA en Render se encuentra despertando de inactividad (cold-start). Por favor, repita la prueba en unos segundos.' 
        };
      }
    } else {
      const detail = flaskErr.response?.data?.error || flaskErr.message;
      throw { statusCode: 502, message: `Error en el microservicio de IA: ${detail}` };
    }
  }

  // Validar que Flask devolvió biomarcadores
  if (!data || !data.biomarcadores) {
    throw {
      statusCode: 502,
      message: `El microservicio de IA no devolvió biomarcadores. Respuesta: ${JSON.stringify(data)}`
    };
  }

  // 2. Buscar médico responsable por múltiples rutas
  let medicoId = explicitMedicoId;

  if (!medicoId) {
    // Ruta 1: expediente del paciente (relación principal)
    const expRes = await query(
      `SELECT medico_responsable_id FROM expedientes WHERE paciente_id = $1 LIMIT 1`,
      [pacienteId]
    );
    if (expRes.rows[0]?.medico_responsable_id) {
      medicoId = expRes.rows[0].medico_responsable_id;
    }
  }

  if (!medicoId) {
    // Ruta 2: médico de la cita más reciente del paciente
    const citaRes = await query(
      `SELECT medico_id FROM citas WHERE paciente_id = $1 ORDER BY fecha_hora DESC LIMIT 1`,
      [pacienteId]
    );
    if (citaRes.rows[0]?.medico_id) {
      medicoId = citaRes.rows[0].medico_id;
    }
  }

  // Ruta 3: Fallback automático - Asignar primer médico especialista activo
  if (!medicoId) {
    const defaultMedRes = await query('SELECT id FROM medicos WHERE activo = TRUE ORDER BY id ASC LIMIT 1');
    if (defaultMedRes.rows.length > 0) {
      medicoId = defaultMedRes.rows[0].id;
      // Vincular formalmente en el expediente del paciente para que quede asignado de forma permanente
      await query(
        `UPDATE expedientes 
         SET medico_responsable_id = $1 
         WHERE paciente_id = $2 AND (medico_responsable_id IS NULL OR medico_responsable_id = 0)`,
        [medicoId, pacienteId]
      );
    }
  }

  // Validación de seguridad final (por si no hubiese médicos en la base de datos)
  if (!medicoId) {
    throw {
      statusCode: 400,
      message: 'No se puede registrar el biomarcador: No se encontró ningún médico especialista activo en el sistema.'
    };
  }

  const resultadoIa = {
    probabilidad: data.probabilidad,
    riesgo: data.riesgo,
    interpretacion: data.interpretacion,
    comparacion_modelos: data.comparacion_modelos,
    f0: data.biomarcadores?.f0 ?? null
  };

  // 3. Persistir biomarcadores individuales con resultado_ia
  // Jitter (id: 1)
  await query(`
    INSERT INTO registros_biomarcador (paciente_id, medico_id, biomarcador_id, valor, resultado_ia)
    VALUES ($1, $2, 1, $3, $4)
  `, [pacienteId, medicoId, data.biomarcadores.jitter, resultadoIa]);

  // Shimmer (id: 2)
  await query(`
    INSERT INTO registros_biomarcador (paciente_id, medico_id, biomarcador_id, valor, resultado_ia)
    VALUES ($1, $2, 2, $3, $4)
  `, [pacienteId, medicoId, data.biomarcadores.shimmer, resultadoIa]);

  // HNR (id: 3)
  await query(`
    INSERT INTO registros_biomarcador (paciente_id, medico_id, biomarcador_id, valor, resultado_ia)
    VALUES ($1, $2, 3, $3, $4)
  `, [pacienteId, medicoId, data.biomarcadores.hnr, resultadoIa]);

  return data;
};

const probarModelos = async (features) => {
  const baseUrl = getMlUrl();
  const response = await axios.post(`${baseUrl}/api/predict`, features, { timeout: 60000 });
  return response.data;
};

module.exports = {
  createRegistro,
  getRegistrosByPaciente,
  getAlertas,
  getDashboardStats,
  createRegistroVoz,
  probarModelos
};
