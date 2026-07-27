const ejerciciosService = require('../services/ejercicios.service');

const getEjercicios = async (req, res, next) => {
  try {
    const result = await ejerciciosService.getAllEjercicios();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const completarRutina = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const result = await ejerciciosService.completarRutina(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEjercicios,
  completarRutina
};
