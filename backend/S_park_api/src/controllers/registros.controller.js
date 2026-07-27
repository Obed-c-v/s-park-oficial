const registrosService = require('../services/registros.service');

const createRegistro = async (req, res, next) => {
  try {
    const { paciente_id, biomarcador_id, valor } = req.body;
    const medico_id = req.user.medico_id;

    if (!medico_id) {
      return res.status(403).json({ message: 'Only doctors can record biomarkers' });
    }

    const result = await registrosService.createRegistro(paciente_id, medico_id, biomarcador_id, valor);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getRegistrosByPaciente = async (req, res, next) => {
  try {
    const { paciente_id } = req.params;
    const result = await registrosService.getRegistrosByPaciente(paciente_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAlertas = async (req, res, next) => {
  try {
    const { medico_id, rol } = req.user;
    if (!medico_id && rol !== 'ADMIN') return res.status(403).json({ message: 'Unauthorized' });

    const result = await registrosService.getAlertas(medico_id, rol);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const { medico_id, rol } = req.user;
    if (!medico_id && rol !== 'ADMIN') return res.status(403).json({ message: 'Unauthorized' });

    const result = await registrosService.getDashboardStats(medico_id, rol);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createRegistroVoz = async (req, res, next) => {
  try {
    const { audio } = req.body;
    let paciente_id = req.user?.paciente_id;
    let medico_id = req.user?.medico_id || null;

    // Si el token es antiguo y no contiene paciente_id/medico_id, los buscamos dinámicamente
    if (req.user && req.user.rol === 'PACIENTE' && !paciente_id) {
      const { query } = require('../config/db');
      const pacienteRes = await query(`
        SELECT p.id as paciente_id, e.medico_responsable_id 
        FROM pacientes p
        LEFT JOIN expedientes e ON p.id = e.paciente_id
        WHERE p.usuario_id = $1
      `, [req.user.user_id]);
      
      if (pacienteRes.rows.length > 0) {
        paciente_id = pacienteRes.rows[0].paciente_id;
        medico_id = pacienteRes.rows[0].medico_responsable_id;
      }
    }

    // Si sigue sin estar definido (por ejemplo, llamada sin token o rol médico), usamos el del body
    if (!paciente_id) {
      paciente_id = req.body.paciente_id;
    }

    if (!paciente_id || !audio) {
      return res.status(400).json({ message: 'paciente_id and audio (base64) are required' });
    }

    const result = await registrosService.createRegistroVoz(paciente_id, audio, medico_id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const probarModelos = async (req, res, next) => {
  try {
    const result = await registrosService.probarModelos(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRegistro,
  getRegistrosByPaciente,
  getAlertas,
  getDashboardStats,
  createRegistroVoz,
  probarModelos
};
