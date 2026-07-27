const express = require('express');
const router = express.Router();
const registrosController = require('../controllers/registros.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Registros
 *   description: Calificaciones y biomarcadores de voz
 */

/**
 * @swagger
 * /registros:
 *   post:
 *     summary: Crear nuevo registro de biomarcadores
 *     tags: [Registros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paciente_id
 *               - jitter
 *               - shimmer
 *               - hnr
 *             properties:
 *               paciente_id:
 *                 type: integer
 *               jitter:
 *                 type: number
 *               shimmer:
 *                 type: number
 *               hnr:
 *                 type: number
 *     responses:
 *       201:
 *         description: Registro creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, authorize(['MEDICO', 'ADMIN']), registrosController.createRegistro);
router.post('/voz', authenticate, registrosController.createRegistroVoz);

/**
 * @swagger
 * /registros/probar-modelos:
 *   post:
 *     summary: Probar los modelos de IA con datos de voz artificiales/estandarizados
 *     description: Permite evaluar la predicción del ensamble de los 4 modelos de IA (Random Forest, SVM, Gradient Boosting, XGBoost) usando parámetros acústicos. Opcionalmente guarda la prueba para re-entrenamiento si se indica el diagnóstico real.
 *     tags: [Registros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               es_parkinson:
 *                 type: integer
 *                 description: "Diagnóstico real / Ground Truth (Opcional: 0 = Sano, 1 = Parkinson). Si se proporciona, la prueba se almacenará en 'ml/outputs/pruebas_historial.csv' para futuro re-entrenamiento de los modelos."
 *                 enum: [0, 1]
 *               "MDVP:Fo(Hz)":
 *                 type: number
 *                 description: Frecuencia fundamental media (Hz)
 *               "MDVP:Fhi(Hz)":
 *                 type: number
 *                 description: Frecuencia fundamental máxima (Hz)
 *               "MDVP:Flo(Hz)":
 *                 type: number
 *                 description: Frecuencia fundamental mínima (Hz)
 *               "MDVP:Jitter(%)":
 *                 type: number
 *                 description: Jitter en porcentaje
 *               "MDVP:Jitter(Abs)":
 *                 type: number
 *                 description: Jitter absoluto
 *               "MDVP:RAP":
 *                 type: number
 *                 description: Perturbación de tono relativa (RAP)
 *               "MDVP:PPQ":
 *                 type: number
 *                 description: Cociente de perturbación de periodo de 5 puntos
 *               "Jitter:DDP":
 *                 type: number
 *                 description: Diferencia promedio absoluta de diferencias de jitter
 *               "MDVP:Shimmer":
 *                 type: number
 *                 description: Shimmer local
 *               "MDVP:Shimmer(dB)":
 *                 type: number
 *                 description: Shimmer en decibelios
 *               "Shimmer:APQ3":
 *                 type: number
 *                 description: Cociente de perturbación de amplitud de 3 puntos
 *               "Shimmer:APQ5":
 *                 type: number
 *                 description: Cociente de perturbación de amplitud de 5 puntos
 *               "MDVP:APQ":
 *                 type: number
 *                 description: Cociente de perturbación de amplitud de 11 puntos
 *               "Shimmer:DDA":
 *                 type: number
 *                 description: Diferencia promedio absoluta de diferencias de shimmer
 *               "NHR":
 *                 type: number
 *                 description: Relación ruido a armónicos
 *               "HNR":
 *                 type: number
 *                 description: Relación armónicos a ruido (dB)
 *               "RPDE":
 *                 type: number
 *                 description: Parámetro de entropía del periodo de recurrencia
 *               "DFA":
 *                 type: number
 *                 description: Análisis de fluctuación sin tendencia
 *               "spread1":
 *                 type: number
 *                 description: Medida de variación de frecuencia fundamental no lineal 1
 *               "spread2":
 *                 type: number
 *                 description: Medida de variación de frecuencia fundamental no lineal 2
 *               "D2":
 *                 type: number
 *                 description: Dimensión de correlación no lineal
 *               "PPE":
 *                 type: number
 *                 description: Entropía del periodo de tono
 *           examples:
 *             ejemplo_sano:
 *               summary: Ejemplo de Voz Sana (Bajo Riesgo)
 *               value:
 *                 es_parkinson: 0
 *                 "MDVP:Fo(Hz)": 197.076
 *                 "MDVP:Fhi(Hz)": 206.896
 *                 "MDVP:Flo(Hz)": 192.055
 *                 "MDVP:Jitter(%)": 0.00289
 *                 "MDVP:Jitter(Abs)": 0.00001
 *                 "MDVP:RAP": 0.00166
 *                 "MDVP:PPQ": 0.00168
 *                 "Jitter:DDP": 0.00498
 *                 "MDVP:Shimmer": 0.01098
 *                 "MDVP:Shimmer(dB)": 0.097
 *                 "Shimmer:APQ3": 0.00563
 *                 "Shimmer:APQ5": 0.0068
 *                 "MDVP:APQ": 0.00802
 *                 "Shimmer:DDA": 0.01689
 *                 "NHR": 0.00339
 *                 "HNR": 26.775
 *                 "RPDE": 0.422229
 *                 "DFA": 0.741367
 *                 "spread1": -7.3483
 *                 "spread2": 0.177551
 *                 "D2": 1.743867
 *                 "PPE": 0.085569
 *             ejemplo_parkinson:
 *               summary: Ejemplo de Voz Parkinson (Riesgo Alto)
 *               value:
 *                 es_parkinson: 1
 *                 "MDVP:Fo(Hz)": 119.992
 *                 "MDVP:Fhi(Hz)": 157.302
 *                 "MDVP:Flo(Hz)": 74.997
 *                 "MDVP:Jitter(%)": 0.00784
 *                 "MDVP:Jitter(Abs)": 0.00007
 *                 "MDVP:RAP": 0.0037
 *                 "MDVP:PPQ": 0.00554
 *                 "Jitter:DDP": 0.01109
 *                 "MDVP:Shimmer": 0.04374
 *                 "MDVP:Shimmer(dB)": 0.426
 *                 "Shimmer:APQ3": 0.02182
 *                 "Shimmer:APQ5": 0.0313
 *                 "MDVP:APQ": 0.02971
 *                 "Shimmer:DDA": 0.06545
 *                 "NHR": 0.02211
 *                 "HNR": 21.033
 *                 "RPDE": 0.414783
 *                 "DFA": 0.815285
 *                 "spread1": -4.813031
 *                 "spread2": 0.266482
 *                 "D2": 2.301442
 *                 "PPE": 0.284654
 *     responses:
 *       200:
 *         description: Resultados de predicción de los modelos e indicación de si se guardó el registro.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 probabilidad:
 *                   type: number
 *                   description: Probabilidad promedio del ensamble (%)
 *                 riesgo:
 *                   type: string
 *                   description: Nivel de riesgo clínico (BAJO, MEDIO, ALTO)
 *                 interpretacion:
 *                   type: string
 *                   description: Interpretación clínica descriptiva de los biomarcadores
 *                 comparacion_modelos:
 *                   type: object
 *                   properties:
 *                     "Random Forest":
 *                       type: number
 *                     "SVM":
 *                       type: number
 *                     "Gradient Boosting":
 *                       type: number
 *                     "XGBoost":
 *                       type: number
 *       500:
 *         description: Error de comunicación con el microservicio de IA
 */
router.post('/probar-modelos', registrosController.probarModelos);

/**
 * @swagger
 * /registros/{paciente_id}:
 *   get:
 *     summary: Obtener historial de registros de un paciente
 *     tags: [Registros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paciente_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de registros
 *       401:
 *         description: No autorizado
 */
router.get('/:paciente_id', authenticate, registrosController.getRegistrosByPaciente);

/**
 * @swagger
 * /alertas:
 *   get:
 *     summary: Obtener alertas de pacientes con riesgo alto
 *     tags: [Registros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No autorizado
 */
router.get('/alertas/all', authenticate, authorize(['MEDICO', 'ADMIN']), registrosController.getAlertas);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obtener estadísticas globales para el dashboard
 *     tags: [Registros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No autorizado
 */
router.get('/dashboard/stats', authenticate, authorize(['MEDICO', 'ADMIN']), registrosController.getDashboardStats);

module.exports = router;
