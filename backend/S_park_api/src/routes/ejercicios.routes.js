const express = require('express');
const router = express.Router();
const ejerciciosController = require('../controllers/ejercicios.controller');
const authenticate = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Ejercicios
 *   description: Gestión de rutinas de ejercicio y bienestar
 */

/**
 * @swagger
 * /ejercicios:
 *   get:
 *     summary: Obtener todas las rutinas de ejercicio disponibles
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ejercicios
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticate, ejerciciosController.getEjercicios);

/**
 * @swagger
 * /ejercicios/completar:
 *   post:
 *     summary: Registrar la finalización de una rutina para el paciente logueado
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progreso actualizado (racha y puntos)
 *       401:
 *         description: No autorizado
 */
router.post('/completar', authenticate, ejerciciosController.completarRutina);

module.exports = router;
