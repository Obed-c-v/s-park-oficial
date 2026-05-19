const authService = require('../services/auth.service');
const path = require('path');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { email, password, nombre, apellido, especialidad, numero_licencia, telefono } = req.body;
    if (!email || !password || !nombre || !apellido || !especialidad || !numero_licencia) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios para el registro médico' });
    }
    const result = await authService.registerMedico(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { user_id, rol, medico_id } = req.user;
    const result = await authService.getMe(user_id, rol, medico_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { user_id, rol, medico_id } = req.user;
    const result = await authService.updateProfile(user_id, rol, medico_id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    const result = await authService.changePassword(user_id, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    const { user_id, rol, medico_id } = req.user;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Build the public URL for the uploaded file
    const fotoUrl = `/uploads/avatars/${req.file.filename}`;
    const result = await authService.updatePhoto(user_id, rol, medico_id, fotoUrl);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe, updateProfile, changePassword, uploadPhoto };
