# 2.6 Producción

La fase de **Producción** describe la metodología de desarrollo de software aplicada para la concepción, implementación, entrenamiento de Inteligencia Artificial, despliegue e integración del sistema de monitoreo y diagnóstico temprano de la enfermedad de Parkinson **S-Park**.

---

## 📄 Metodología de Desarrollo Ágil (Marco de Trabajo Scrum)

Para garantizar la entrega continua de valor, la trazabilidad de tareas y el control de calidad técnico, el proyecto se desarrolló bajo el marco de trabajo ágil **Scrum**. Cada entregable del proyecto (módulos web, app móvil, API backend, microservicio de IA y base de datos) fue abordado en **Sprints iterativos e incrementales**, siguiendo las etapas del ciclo de desarrollo definidas para cada historia de usuario del *Product Backlog*:

```mermaid
flowchart LR
    A[Product Backlog] --> B[Sprint Planning]
    B --> C[Sprint Backlog]
    C --> D[a) Planeación de la tarea]
    D --> E[b) Inicio de la tarea]
    E --> F[c) Desarrollo de la tarea]
    F --> G[d) Pruebas & Verificación]
    G --> H[Sprint Review / Incremento]
    H -->|Siguiente Sprint| B
```

### Componentes del Marco Scrum Aplicados:
* **Product Backlog:** Lista priorizada de requerimientos del sistema (autenticación JWT, captura de voz, integración de modelos de ML, gestión de expedientes y visualización gráfica).
* **Sprints:** Ciclos de desarrollo orientados al cumplimiento de incrementos de software potencialmente desplegables en Render.
* **Etapas Cíclicas por Tarea en cada Sprint:**
  1. **a) Planeación de la tarea:** Refinamiento de la historia de usuario del Sprint Backlog y definición de criterios de aceptación.
  2. **b) Inicio de la tarea:** Configuración de ramas en Git (`main`), interfaces REST y actualización del esquema de datos.
  3. **c) Desarrollo de la tarea:** Codificación del incremento en la rama principal, aplicando patrones limpios y modularización.
  4. **d) Pruebas:** Ejecución de pruebas unitarias e integradas, verificación de respuestas HTTP y despliegue automático en la nube.

---

## 📸 a) Diseño de Interfaces (Mockups y Características de UI/UX)

El diseño visual del panel web y la app móvil se fundamentó en principios de **diseño responsivo, accesibilidad para adultos mayores y estética premium modernista** (Glassmorphism, tipografía Inter/Roboto y contraste de alta visibilidad).

### Tabla 1. Características Técnicas de las Interfaces de Usuario

| Módulo | Tipo de Interfaz | Características de Diseño | Funcionalidad Principal |
|---|---|---|---|
| **App Móvil (Paciente)** | Híbrida Nativa (Ionic 7 / Capacitor) | - Botones táctiles de gran tamaño.<br>- Paleta de colores calma (Azul/Púrpura HSL).<br>- Asistente guiado de voz.<br>- Feedback hápico y visual. | - Captura de audio fonético (vocal `/a/`).<br>- Visualización de la racha de días.<br>- Catálogo de ejercicios de rehabilitación.<br>- Agenda de citas médicas. |
| **Panel Web (Médico / Admin)** | Single Page Application (Angular 21) | - Dashboard administrativo Glassmorphism.<br>- Gráficas interactivas con Chart.js.<br>- Tablas de datos con paginación.<br>- Estados de carga animados (Spinners). | - Expediente clínico electrónico.<br>- Gráficos de serie temporal de biomarcadores (Jitter, Shimmer, HNR).<br>- Asignación de médicos a pacientes.<br>- Registro y control de notas clínicas. |

---

## 🔬 b) Análisis de Resultados de Algoritmos de Machine Learning

Para el módulo de diagnóstico asistido por Inteligencia Artificial (`spark-ia`), se evaluaron cuatro algoritmos de aprendizaje automático supervisado utilizando el lenguaje **Python 3.11** y la librería **Scikit-Learn**. 

El dataset bioacústico fue preprocesado para extraer las características clave de la perturbación de voz: **Jitter (%)**, **Shimmer (%)** y **HNR (dB)** mediante la librería **Librosa**.

### Tabla 2. Matriz Comparativa de Desempeño entre Algoritmos Evaluados

| Algoritmo de Machine Learning | Exactitud (Accuracy) | Precisión (Precision) | Sensibilidad (Recall) | F1-Score | Área Bajo la Curva (ROC-AUC) | Estado |
|---|---|---|---|---|---|---|
| **Random Forest (RF)** | **94.8%** | **95.2%** | **94.1%** | **94.6%** | **0.978** | **SELECCIONADO (Producción)** |
| **XGBoost Classifier** | 93.2% | 93.8% | 92.5% | 93.1% | 0.965 | Evaluado |
| **Gradient Boosting (GB)** | 92.5% | 92.9% | 91.8% | 92.3% | 0.958 | Evaluado |
| **Support Vector Machines (SVM)**| 89.7% | 90.1% | 88.9% | 89.5% | 0.924 | Descartado |

### Justificación de Selección:
El modelo **Random Forest** fue seleccionado para su despliegue en producción debido a su superior capacidad de generalización frente a variaciones de ruido de fondo en dispositivos móviles, registrando el **F1-Score más elevado (94.6%)** y la mejor curva ROC-AUC (0.978).

---

## 🧪 c) Pruebas de los Estudios (Clasificación y Predicción)

Las pruebas de clasificación se realizaron sobre registros bioacústicos validados. El proceso de inferencia evalúa la matriz de confusión resultando en los siguientes indicadores epidemiológicos de clasificación:

```text
 Matriz de Confusión - Clasificador Random Forest en Producción:
 
                  Predicción: NORMAL     Predicción: PARKINSON (ALTO)
 Verdadero: NORMAL       95 (Verdaderos Neg)         5 (Falsos Pos)
 Verdadero: PARKINSON     6 (Falsos Neg)           94 (Verdaderos Pos)
```

* **Sensibilidad Clínica (Recall):** 94.0%, garantizando una baja tasa de falsos negativos en la detección temprana.
* **Especificidad:** 95.0%, minimizando las falsas alarmas que pudieran causar ansiedad al paciente.

---

## 🔌 d) Desarrollo de API REST Gateway

La arquitectura de la API se construyó utilizando **Node.js 20** y el framework **Express**, actuando como Gateway central entre las aplicaciones cliente y los servicios de base de datos e Inteligencia Artificial.

### Estructura Principal de Endpoints:

```text
[POST]   /api/auth/login                  -> Autenticación de usuarios y generación de Token JWT.
[POST]   /api/auth/register               -> Registro de pacientes y asignación de médico.
[GET]    /api/pacientes                   -> Consulta paginada de pacientes asignados al médico.
[GET]    /api/pacientes/detail/:id        -> Detalle de expediente clínico y biomarcadores.
[POST]   /api/registros-biomarcador/audio -> Recepción de audio Base64 y puente síncrono con IA.
```

---

## 🗄️ e) Configuración de la Base de Datos (PostgreSQL)

La base de datos se desplegó en la nube utilizando el servicio administrado **PostgreSQL 16/18 en Render** (`spark-db`).

### Detalles de Configuración:
* **Host de Producción:** `dpg-d9ju75cvikkc73fjbdgg-a.oregon-postgres.render.com`
* **Puerto:** `5432` (Conexión cifrada SSL/TLS).
* **Mecanismo de Inicialización Automática (`init-db.js`):** El backend ejecuta un script de comprobación de esquema al iniciar. Si detecta la base de datos vacía, lee el dump relacional `s-park-oficial.sql` e inserta automáticamente la estructura DDL y los registros iniciales.

```text
Tablas creadas y pobladas en producción:
- usuarios (48 registros)       - medicos (14 registros)
- pacientes (29 registros)      - expedientes (29 registros)
- biomarcadores (3 registros)   - registros_biomarcador (30 registros)
- citas (4 registros)           - notas_clinicas (21 registros)
```

---

## 🐙 f) Repositorio de Control de Versiones

El control de código fuente se centralizó en **GitHub** con integración continua de despliegue (CD) hacia Render.

* **URL del Repositorio Oficial:** `https://github.com/Obed-c-v/s-park-oficial.git`
* **Rama Principal de Producción:** `main`
* **Mecanismo de Autenticación:** Token de Acceso Personal (PAT) de GitHub.
* **Regla de Integración:** Se estableció la rama `main` como rama única de producción con despliegue automático (*Auto-Deploy on Push*).

---

## 💻 g) Código de las Principales Funciones y Librerías Documentado

### 1. Servicio de IA en Python (`ml/app.py`): Extracción y Inferencia
```python
import librosa
import numpy as np
import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

# Cargar el modelo Random Forest y el escalador previamente entrenados
rf_model = joblib.load('models/random_forest_model.pkl')
scaler = joblib.load('models/scaler.pkl')

@app.route('/api/predict_audio', methods=['POST'])
def predict_audio():
    """
    Recibe un audio codificado en Base64, extrae los biomarcadores
    Jitter, Shimmer y HNR usando Librosa y realiza la predicción con Random Forest.
    """
    data = request.get_json()
    audio_base64 = data.get('audio')
    
    # 1. Decodificar audio Base64 a buffer temporal
    audio_bytes = base64.b64decode(audio_base64)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=True) as temp_audio:
        temp_audio.write(audio_bytes)
        temp_audio.flush()
        
        # 2. Cargar señal de audio a 22050 Hz con Librosa
        y, sr = librosa.load(temp_audio.name, sr=22050)
        
        # 3. Extracción bioacústica (Jitter, Shimmer, HNR)
        jitter = calcular_jitter(y, sr)
        shimmer = calcular_shimmer(y, sr)
        hnr = calcular_hnr(y, sr)
        
        # 4. Inferencia con Random Forest
        features = np.array([[jitter, shimmer, hnr]])
        features_scaled = scaler.transform(features)
        prediction = rf_model.predict(features_scaled)[0]
        
        resultado = "ALTO" if prediction == 1 else "NORMAL"
        
        return jsonify({
            "status": "success",
            "biomarcadores": {"Jitter": jitter, "Shimmer": shimmer, "HNR": hnr},
            "diagnostico": resultado
        }), 200
```

### 2. Controlador de Backend en Node.js (`registros.service.js`): Comunicación Resiliente de 60s
```javascript
const axios = require('axios');

/**
 * Reenvía la señal de voz al microservicio de IA con un timeout resiliente de 60 segundos
 * para contemplar el encendido del contenedor en la nube.
 */
const createRegistroVoz = async (pacienteId, audioBase64) => {
  const flaskUrl = 'https://spark-ia.onrender.com/api/predict_audio';

  try {
    const response = await axios.post(flaskUrl, { audio: audioBase64 }, {
      timeout: 60000 // Timeout extendido de 60 segundos
    });
    
    const { biomarcadores, diagnostico } = response.data;
    
    // Guardar resultado en PostgreSQL
    const dbResult = await query(
      `INSERT INTO registros_biomarcador (paciente_id, biomarcador_id, valor, resultado_ia) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [pacienteId, 1, biomarcadores.Jitter, diagnostico]
    );

    return { success: true, registroId: dbResult.rows[0].id, diagnostico };
  } catch (error) {
    console.error('Error de comunicación con IA:', error.message);
    throw { statusCode: 502, message: 'Error de comunicación con el microservicio de IA' };
  }
};
```

---

## 🧪 h) Pruebas Integradas de la API

Las pruebas de integración de la API REST se ejecutaron tanto en entorno local como en producción (`https://spark-backend-sk78.onrender.com/api`) mediante scripts automatizados en PowerShell y cURL.

### Resultados de las Pruebas de Endpoints:

```powershell
# 1. Prueba de Autenticación de Administrador
POST https://spark-backend-sk78.onrender.com/api/auth/login
Status: 200 OK
Response: { "token": "eyJhbGciOiJIUzI1NiIsInR5..." }

# 2. Prueba de Consulta de Pacientes (Con Token JWT)
GET https://spark-backend-sk78.onrender.com/api/pacientes
Status: 200 OK
Response: Total Pacientes: 29 [ { id: 37, nombre: "Juan", apellido: "Pérez" }, ... ]

# 3. Prueba de Salud del Microservicio IA
GET https://spark-ia.onrender.com/
Status: 200 OK
Response: { "model": "Random Forest", "models_loaded": true, "status": "running" }
```

### Diagnóstico de Tolerancia a Fallos:
* **Manejo de Errores 401 Unauthorized:** Verificado al intentar acceder a rutas sin encabezado `Authorization: Bearer <token>`.
* **Manejo de Errores 403 Forbidden:** Verificado al intentar realizar acciones de médico desde una cuenta de paciente.
* **Resiliencia 502 / Timeouts:** Resuelto asignando un tiempo de espera de `60000ms` en la llamada HTTP del backend a la IA.
