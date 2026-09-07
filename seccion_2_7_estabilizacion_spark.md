# 2.7 Estabilización

La fase de **Estabilización** documenta la madurez operativa del sistema **S-Park**, asegurando la transferibilidad técnica y el correcto uso del software. Se divide en dos vertientes:
1. **Manual del Sistema Simplificado** (Estructura técnica organizada en tablas de referencia rápida).
2. **Manual de Usuario y Caso de Estudio** (Guía narrativa ilustrada paso a paso del flujo paciente-médico).

---

# PARTE 1. Manual del Sistema Simplificado

## a) Entidades del Proyecto (Tablas de Base de Datos PostgreSQL)

### Tabla 1. Catálogo de Entidades Relacionales de la Base de Datos (`spark-db`)

| Nombre de Entidad | Descripción Técnica | Relaciones Principal |
|---|---|---|
| **`usuarios`** | Almacena credenciales globales de acceso, hashes de contraseñas bcrypt y estado de verificación. | 1:M con `usuario_rol`, 1:1 opcional con `pacientes` y `medicos`. |
| **`roles`** | Catálogo de permisos del sistema (`ADMIN`, `MEDICO`, `PACIENTE`). | 1:M con `usuario_rol`. |
| **`usuario_rol`** | Tabla asociativa que implementa la asignación de permisos a usuarios. | N:M entre `usuarios` y `roles`. |
| **`pacientes`** | Perfil demográfico del paciente (nombre, fecha de nacimiento, teléfono, racha de días, puntos). | 1:1 con `usuarios`, 1:1 con `expedientes`. |
| **`medicos`** | Datos profesionales del personal médico (cédula profesional, especialidad, estado). | 1:1 con `usuarios`, 1:M con `expedientes` y `paciente_ejercicio`. |
| **`expedientes`** | Carpeta clínica del paciente. Vincula de forma obligatoria un paciente con su médico responsable. | 1:1 con `pacientes`, M:1 con `medicos`, 1:M con `notas_clinicas`. |
| **`notas_clinicas`** | Diagnósticos u observaciones médicas registradas en el expediente clínico. | M:1 con `expedientes`, M:1 con `medicos`. |
| **`biomarcadores`** | Catálogo de métricas acústicas de voz (Jitter, Shimmer, HNR) y sus rangos fisiológicos. | 1:M con `registros_biomarcador`. |
| **`registros_biomarcador`** | Serie temporal de pruebas de voz almacenando valores numéricos y el resultado de la IA. | M:1 con `pacientes`, M:1 con `medicos`, M:1 con `biomarcadores`. |
| **`citas`** | Programación de consultas médicas de seguimiento. | M:1 con `pacientes`, M:1 con `medicos`. |
| **`ejercicios`** | Catálogo de actividades de rehabilitación física y fonética. | 1:M con `paciente_ejercicio`. |
| **`paciente_ejercicio`** | Registro de asignación y cumplimiento de terapias prescritas a los pacientes. | M:1 con `pacientes`, M:1 con `medicos`, M:1 con `ejercicios`. |

---

## b) Métodos utilizables de la API REST (`spark-backend`)

### Tabla 2. Especificación de Endpoints y Métodos de la API REST Gateway

| Método HTTP | Endpoint | Descripción de Operación | Parámetros / Payload Requerido |
|---|---|---|---|
| **`POST`** | `/api/auth/login` | Autentica un usuario y firma un Token JWT válido. | `{ email, password, source }` |
| **`POST`** | `/api/auth/register` | Registra un nuevo paciente y asigna médico por defecto. | `{ email, nombre, apellido, fecha_nacimiento, sexo, telefono, medico_id }` |
| **`GET`** | `/api/auth/me` | Retorna el perfil autenticado del usuario actual. | Header `Authorization: Bearer <token>` |
| **`GET`** | `/api/pacientes` | Lista los pacientes asignados al médico autenticado. | Header `Authorization: Bearer <token>` |
| **`GET`** | `/api/pacientes/detail/:id` | Obtiene expediente completo, biomarcadores y notas. | Parámetro URL `:id` (ID del paciente) |
| **`POST`** | `/api/registros-biomarcador/audio` | Recibe audio en Base64, invoca la IA y guarda el resultado. | `{ pacienteId, audioBase64 }` |
| **`POST`** | `/api/predict_audio` *(IA)* | Microservicio Flask: procesa audio con Librosa y Random Forest. | `{ audio: audioBase64 }` |

---

## c) Directorios y Archivos del Proyecto

### Tabla 3. Estructura de Directorios del Sistema Ecosistema S-Park

| Módulo / Ruta | Archivo Clave | Descripción y Función |
|---|---|---|
| **`frontend/`** | `src/app/app.routes.ts` | Configuración de rutas y guards de navegación SPA del Panel Web Angular. |
| | `src/app/pages/login/login.ts` | Controlador standalone de inicio de sesión con animaciones. |
| | `src/environments/environment.prod.ts` | Configuración de URLs de producción apuntando al backend en Render. |
| **`frontend-movil-ionic/`**| `src/app/core/services/auth.service.ts` | Servicio centralizado de autenticación y consumo de APIs en la App Móvil. |
| | `src/app/tab1/tab1.page.ts` | Vista principal del paciente con captura de audio y contador de racha. |
| | `android/` | Proyecto nativo compilado con Capacitor para generación del paquete APK. |
| **`backend/S_park_api/`** | `src/server.js` | Punto de entrada del servidor Express REST API. |
| | `src/config/init-db.js` | Script de comprobación y siembra automática de base de datos (`s-park-oficial.sql`). |
| | `src/services/registros.service.js` | Lógica de comunicación síncrona con timeout de 60s hacia la IA. |
| | `src/services/pacientes.service.js` | Lógica de creación de pacientes con asignación forzosa de médico. |
| **`ml/`** | `app.py` | Microservicio en Python Flask que sirve la API de Inteligencia Artificial. |
| | `requirements.txt` | Lista de librerías en Python (Librosa, Scikit-Learn, Pandas, Gunicorn). |
| | `models/random_forest_model.pkl` | Binario comprimido del clasificador entrenado Random Forest. |

---

## d) Clases, Objetos y Métodos del Sistema

### Tabla 4. Objetos y Clases de Manipulación de Datos

| Nombre del Objeto / Clase | Métodos Asociados | Funcionalidad y Manipulación de Datos |
|---|---|---|
| **`AuthService`** *(Ionic/Angular)* | `login()`, `verifyCode()`, `getMe()` | Almacena y gestiona el Token JWT en el `localStorage` del dispositivo y provee señales reactivas del usuario activo. |
| **`PacientesService`** *(Express Backend)* | `createPaciente()`, `getPacienteDetalle()`, `updatePaciente()` | Administra transacciones SQL relacionales para crear usuarios, expedientes y asignar médicos dentro de bloques `BEGIN/COMMIT/ROLLBACK`. |
| **`RegistrosService`** *(Express Backend)* | `createRegistroVoz()`, `probarModelos()` | Convierte solicitudes de audio en peticiones Axios hacia Flask y persiste los valores calculados de Jitter/Shimmer/HNR en la BD. |
| **`AudioPreprocessor`** *(Python Flask)* | `librosa.load()`, `calcular_jitter()`, `calcular_shimmer()` | Lee streams temporales en formato WAV, remueve silencio inicial y extrae métricas de perturbación armónica. |

---

## e) Interacción con Dispositivos y Sensores Hardware

### Tabla 5. Módulos de Interacción con Hardware del Dispositivo

| Dispositivo / Sensor | Módulo de Interacción | Método de Captura / API | Funcionalidad |
|---|---|---|---|
| **Micrófono del Smartphone** | `@capacitor-community/voice-recorder` / Web Audio API | `startRecording()`, `stopRecording()` | Captura la frecuencia de voz del paciente durante 5 segundos a 22050 Hz. |
| **Almacenamiento Local** | Capacitor Preferences / HTML5 Storage | `Storage.set()`, `Storage.get()` | Mantiene la sesión persistente cifrada del Token JWT en el teléfono. |
| **Retroalimentación Háptica** | Capacitor Haptics Plugin | `Haptics.vibrate()` | Emite una pulsación vibratoria suave cuando la grabación de voz inicia y finaliza. |

---

## f) URLs y Ejemplos de Datos en Formato JSON

### Tabla 6. Especificación de Ejemplos de Payloads JSON

| Operación | URL de Consulta | Tipo de Payload |
|---|---|---|
| **Autenticación** | `https://spark-backend-sk78.onrender.com/api/auth/login` | Request / Response JSON |
| **Análisis de Voz** | `https://spark-backend-sk78.onrender.com/api/registros-biomarcador/audio` | Request / Response JSON |
| **Diagnóstico IA** | `https://spark-ia.onrender.com/api/predict_audio` | Request / Response JSON |

#### 1. Autenticación (`POST /api/auth/login`)

**Solicitud (Request JSON):**
```json
{
  "email": "paciente@spark.com",
  "password": "paciente123",
  "source": "mobile"
}
```

**Respuesta Exitosa (Response JSON 200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2Miwicm9sIjoiUEFDSUVOVEUiLCJpYXQiOjE3ODUxNzk1MDB9...",
  "user": {
    "id": 62,
    "email": "paciente@spark.com",
    "rol": "PACIENTE",
    "nombre": "Juan",
    "apellido": "Pérez"
  }
}
```

#### 2. Análisis de Voz (`POST /api/registros-biomarcador/audio`)

**Solicitud (Request JSON):**
```json
{
  "pacienteId": 37,
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."
}
```

**Respuesta Exitosa (Response JSON 200 OK):**
```json
{
  "success": true,
  "registroId": 104,
  "diagnostico": "NORMAL",
  "biomarcadores": {
    "Jitter": 0.42,
    "Shimmer": 1.85,
    "HNR": 24.6
  }
}
```

---

# PARTE 2. Manual de Usuario: Caso de Estudio Real Paso a Paso

El siguiente caso de estudio ejemplifica la experiencia completa de uso del sistema S-Park, guiando al **Paciente Juan Pérez** en su seguimiento diario desde la aplicación móvil y al **Dr. Roberto Martines** en el monitoreo desde el panel web.

---

### 📱 Paso 1: Inicio de Sesión y Autenticación en la App Móvil

El paciente abre la aplicación móvil S-Park en su dispositivo Android. Ingresa sus credenciales de acceso registradas previamente por su médico.

> [!NOTE]
> **Credenciales del Caso de Estudio:**
> * **Correo:** `paciente@spark.com`
> * **Contraseña:** `paciente123`

```text
+-------------------------------------------------------+
|                   S-PARK MOBILE                       |
|                                                       |
|             [ Iniciar Sesión ]                        |
|  Correo:     [ paciente@spark.com             ]       |
|  Contraseña: [ ***********                   ]       |
|                                                       |
|                ( INGRESAR AL PANEL )                  |
+-------------------------------------------------------+
```

Al hacer clic en **Ingresar al Panel**, la app envía la solicitud a la API, recibe el Token JWT y redirige automáticamente al paciente a la pantalla principal (**Tab 1**).

---

### 🎙️ Paso 2: Realización de la Prueba de Voz (Captura Bioacústica)

Una vez en la pantalla principal, el paciente selecciona el botón principal de **Iniciar Evaluación Vocal**.

```text
+-------------------------------------------------------+
|  Hola, Juan Pérez 👋           Racha: 3 días 🔥       |
|                                                       |
|     +-------------------------------------------+     |
|     |       🎙️ EVALUACIÓN DE VOZ DIARIA        |     |
|     |  Instrucciones: Presiona el botón y pronuncia |     |
|     |  la vocal /a/ de forma sostenida 5 seg.   |     |
|     |                                           |     |
|     |             [ 🔴 GRABAR /A/ ]             |     |
|     +-------------------------------------------+     |
+-------------------------------------------------------+
```

1. El paciente presiona **🔴 GRABAR /A/**. El teléfono emite una pulsación háptica y activa el micrófono.
2. El paciente emite el sonido sostenido `/a/`.
3. A los 5 segundos, la grabación se detiene automáticamente, se codifica en Base64 y se envía al servidor.

> [!TIP]
> **Resiliencia de Conexión:** El backend mantiene una conexión tolerante de hasta 60 segundos para permitir que el servicio de Inteligencia Artificial procese la señal de audio en la nube sin desconexiones.

---

### 🤖 Paso 3: Procesamiento con IA y Feedback para el Paciente

El microservicio de IA procesa la muestra de voz y retorna el dictamen al dispositivo móvil en menos de 3 segundos:

```text
+-------------------------------------------------------+
|              RESULTADO DE LA EVALUACIÓN              |
|                                                       |
|   Diagnóstico de IA:   ✅ RIESGO NORMAL               |
|   Jitter (Frecuencia): 0.42 %   (Rango Óptimo)         |
|   Shimmer (Amplitud):  1.85 %   (Rango Óptimo)         |
|   HNR (Armónicos):     24.6 dB  (Excelente calidad)    |
|                                                       |
|   🎉 ¡Felicidades! Has aumentado tu racha a 4 días.   |
|                                                       |
|                 [ VOLVER AL INICIO ]                  |
+-------------------------------------------------------+
```

El paciente visualiza que su prueba fue clasificada como **NORMAL**, y la aplicación incrementa su **racha de bienestar a 4 días**.

---

### 🖥️ Paso 4: Monitoreo Médico en el Panel Web (Angular Admin)

Simultáneamente, el **Dr. Roberto Martines** ingresa al panel web desde su computadora (`https://spark-frontend.onrender.com`) utilizando su cuenta médica (`admin@spark.com` / `admin123`).

```text
+-----------------------------------------------------------------------------------+
|  S-PARK WEB ADMIN | Dashboard Médico                   Dr. Roberto Martines       |
+-----------------------------------------------------------------------------------+
|  [Pacientes]  [Expedientes]  [Alertas]  [Configuración]                      |
|                                                                                   |
|  Búsqueda de Paciente: [ Juan Pérez                      ] [🔍 Buscar]             |
|                                                                                   |
|  > Paciente: Juan Pérez (ID: 37) | Edad: 49 años | Estado: ACTIVO                |
|  > Médico Responsable: Dr. Roberto Martines Martines                              |
|                                                                                   |
|  HISTORIAL DE BIOMARCADORES DE VOZ:                                               |
|  +-----------------------------------------------------------------------------+  |
|  | Fecha/Hora           | Jitter (%) | Shimmer (%) | HNR (dB) | Resultado IA  |  |
|  |----------------------|------------|-------------|----------|---------------|  |
|  | 2026-07-31 18:35:00  | 0.42 %     | 1.85 %      | 24.6 dB  | ✅ NORMAL     |  |
|  | 2026-07-30 10:12:00  | 0.45 %     | 1.90 %      | 24.1 dB  | ✅ NORMAL     |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [ 📝 Agregar Nota Clínica ]   [ 📅 Agendar Cita ]   [ 🏋️ Asignar Ejercicio ]     |
+-----------------------------------------------------------------------------------+
```

> [!IMPORTANT]
> **Alerta Clínica Automática:** Si la Inteligencia Artificial llega a clasificar una prueba de voz con resultado **ALTO RIESGO**, el sistema genera automáticamente una entrada destacada en rojo en el panel de **Alertas** del médico para permitir una intervención clínica oportuna.
