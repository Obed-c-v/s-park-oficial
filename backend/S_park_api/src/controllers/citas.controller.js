const citasService = require('../services/citas.service');

const createCita = async (req, res, next) => {
  try {
    const { paciente_id, fecha_hora, estado } = req.body;
    const { medico_id, rol } = req.user;

    if (!medico_id && rol !== 'ADMIN') {
      return res.status(403).json({ message: 'Only doctors can create appointments' });
    }

    const result = await citasService.createCita(paciente_id, medico_id, fecha_hora, estado);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getCitasByMedico = async (req, res, next) => {
  try {
    const { medico_id, rol } = req.user;
    if (!medico_id && rol !== 'ADMIN') return res.status(403).json({ message: 'Unauthorized' });

    const result = await citasService.getCitasByMedico(medico_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCita,
  getCitasByMedico
};
