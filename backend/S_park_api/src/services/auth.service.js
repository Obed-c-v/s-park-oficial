const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

/**
 * Service to register a new doctor.
 */
const registerMedico = async (data) => {
  const { email, password, nombre, apellido, especialidad, numero_licencia, telefono } = data;

  const existingUser = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw { statusCode: 400, message: 'Email already registered' };
  }

  const passwordHash = await hashPassword(password);
  const userRes = await query(
    'INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING id',
    [email, passwordHash]
  );
  const userId = userRes.rows[0].id;

  const roleRes = await query('SELECT id FROM roles WHERE nombre = $1', ['MEDICO']);
  const roleId = roleRes.rows[0].id;
  await query('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ($1, $2)', [userId, roleId]);

  await query(
    'INSERT INTO medicos (usuario_id, nombre, apellido, especialidad, numero_licencia, telefono) VALUES ($1, $2, $3, $4, $5, $6)',
    [userId, nombre, apellido, especialidad, numero_licencia, telefono]
  );

  return { message: 'Doctor registered successfully' };
};

/**
 * Service to handle user login.
 */
const login = async (email, password) => {
  const userQuery = `
    SELECT u.id, u.email, u.password_hash, r.nombre as rol
    FROM usuarios u
    JOIN usuario_rol ur ON u.id = ur.usuario_id
    JOIN roles r ON ur.rol_id = r.id
    WHERE u.email = $1 AND u.activo = TRUE
  `;
  const result = await query(userQuery, [email]);

  if (result.rows.length === 0) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const user = result.rows[0];

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  let medico_id = null;
  if (user.rol === 'MEDICO') {
    const medicoQuery = 'SELECT id FROM medicos WHERE usuario_id = $1';
    const medicoResult = await query(medicoQuery, [user.id]);
    if (medicoResult.rows.length > 0) {
      medico_id = medicoResult.rows[0].id;
    }
  }

  const token = generateToken({ user_id: user.id, rol: user.rol, medico_id });

  return {
    token,
    user: { id: user.id, email: user.email, rol: user.rol, medico_id }
  };
};

/**
 * Service to get current user's full profile.
 */
const getMe = async (userId, rol, medicoId) => {
  let details = null;

  if (rol === 'MEDICO' && medicoId) {
    const q = `
      SELECT m.id, m.nombre, m.apellido, m.especialidad, m.numero_licencia, m.telefono, m.foto_url,
             u.email
      FROM medicos m
      JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.id = $1
    `;
    const res = await query(q, [medicoId]);
    details = res.rows[0] || null;
  } else if (rol === 'ADMIN') {
    const q = `SELECT id, email FROM usuarios WHERE id = $1`;
    const res = await query(q, [userId]);
    const adminUser = res.rows[0];
    // For admin, try to get a display name from a possible admin profile table or default
    details = {
      id: adminUser?.id,
      email: adminUser?.email,
      nombre: 'Administrador',
      apellido: '',
      foto_url: null
    };
  }

  return { user_id: userId, rol, medico_id: medicoId, details };
};

/**
 * Update the profile of the currently logged-in user.
 */
const updateProfile = async (userId, rol, medicoId, data) => {
  const { nombre, apellido, telefono, especialidad } = data;

  if (rol === 'MEDICO' && medicoId) {
    await query(
      'UPDATE medicos SET nombre = $1, apellido = $2, telefono = $3, especialidad = $4 WHERE id = $5',
      [nombre, apellido, telefono || null, especialidad || null, medicoId]
    );
  }
  // For ADMIN: no clinical profile to update (name is stored elsewhere or display-only)
  return { message: 'Profile updated successfully' };
};

/**
 * Change the password of the currently logged-in user.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const res = await query('SELECT password_hash FROM usuarios WHERE id = $1', [userId]);
  if (res.rows.length === 0) {
    throw { statusCode: 404, message: 'User not found' };
  }

  const isMatch = await comparePassword(currentPassword, res.rows[0].password_hash);
  if (!isMatch) {
    throw { statusCode: 400, message: 'Current password is incorrect' };
  }

  const newHash = await hashPassword(newPassword);
  await query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [newHash, userId]);
  return { message: 'Password updated successfully' };
};

/**
 * Update the profile photo URL for a doctor.
 */
const updatePhoto = async (userId, rol, medicoId, fotoUrl) => {
  if (rol === 'MEDICO' && medicoId) {
    await query('UPDATE medicos SET foto_url = $1 WHERE id = $2', [fotoUrl, medicoId]);
  } else if (rol === 'ADMIN') {
    await query('UPDATE usuarios SET foto_url = $1 WHERE id = $2', [fotoUrl, userId]);
  }
  return { fotoUrl };
};

module.exports = { registerMedico, login, getMe, updateProfile, changePassword, updatePhoto };
