const citasService = require('../services/citas.service');

const createCita = async (req, res, next) => {
  try {
    const { user_id: userId, medico_id, rol } = req.user;
    const result = await citasService.createCitaForUser(userId, rol, medico_id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getCitasByMedico = async (req, res, next) => {
  try {
    const { user_id: userId, medico_id, rol } = req.user;
    const result = await citasService.getCitasForUser(userId, rol, medico_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const cancelCita = async (req, res, next) => {
  try {
    const { user_id: userId, medico_id, rol } = req.user;
    const citaId = req.params.id;
    const result = await citasService.cancelCitaForUser(userId, rol, medico_id, citaId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateCita = async (req, res, next) => {
  try {
    const { user_id: userId, medico_id, rol } = req.user;
    const citaId = req.params.id;
    const result = await citasService.updateCitaForUser(userId, rol, medico_id, citaId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCita,
  getCitasByMedico,
  cancelCita,
  updateCita
};

