# S-Park — Plataforma Biomédica para Monitoreo Bioacústico del Parkinson

![Version](https://img.shields.io/badge/versión-1.0.0-blue)
![Estado](https://img.shields.io/badge/estado-producción-green)
![Licencia](https://img.shields.io/badge/licencia-ISC-lightgrey)

**S-Park** es una plataforma biomédica de código propio diseñada para el monitoreo continuo y el apoyo al diagnóstico temprano de la enfermedad de Parkinson mediante análisis bioacústico no invasivo de la voz humana.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación y Configuración Local](#instalación-y-configuración-local)
   - [Base de Datos (PostgreSQL)](#1-base-de-datos-postgresql)
   - [Microservicio de IA (Python Flask)](#2-microservicio-de-ia-python-flask)
   - [API Gateway (Node.js / Express)](#3-api-gateway-nodejs--express)
   - [Panel Web Clínico (Angular)](#4-panel-web-clínico-angular)
   - [App Móvil (Ionic / Capacitor)](#5-app-móvil-ionic--capacitor)
6. [Variables de Entorno](#variables-de-entorno)
7. [Despliegue en Producción (Render)](#despliegue-en-producción-render)
8. [Credenciales de Prueba](#credenciales-de-prueba)
9. [Estructura del Repositorio](#estructura-del-repositorio)
10. [Historial de Versiones](#historial-de-versiones)
11. [Autor](#autor)

---

## Descripción General

S-Park integra cuatro componentes principales:

| Componente | Descripción |
|---|---|
| 📱 **App Móvil** (Ionic 7 / Capacitor) | Aplicación para pacientes: grabación vocal, historial personal, gamificación de bienestar |
| 💻 **Panel Web Clínico** (Angular 21) | Dashboard para médicos/neurólogos: expedientes, gráficas de biomarcadores, alertas clínicas |
| 🔌 **API Gateway** (Node.js / Express) | Backend REST con autenticación JWT y control de acceso por roles (RBAC) |
| 🧠 **Microservicio IA** (Python Flask) | Análisis bioacústico de audio con Librosa + modelo Random Forest (94.8% accuracy) |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                 │
│   📱 App Móvil (Ionic/Capacitor)   💻 Panel Web (Angular 21)   │
└──────────────────────┬──────────────────────────┬──────────────┘
                       │  HTTPS / REST             │  HTTPS / REST
                       ▼                           ▼
           ┌───────────────────────────────────────────────┐
           │          API Gateway (Node.js / Express)      │
           │   JWT Auth · RBAC · Rate Limiting · Swagger   │
           └───────────────────┬───────────────────────────┘
                  PostgreSQL   │   HTTP (Flask API)
          ┌────────────────────┼─────────────────────────┐
          ▼                                              ▼
 ┌─────────────────┐                        ┌──────────────────────┐
 │  PostgreSQL 16  │                        │ Microservicio IA     │
 │  (Render DB)    │                        │ Python Flask+Librosa │
 │                 │                        │ Modelo Random Forest │
 └─────────────────┘                        └──────────────────────┘
```

---

## Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|---|---|---|
| App Móvil | Ionic Framework + Capacitor | 7.x / 8.x |
| App Móvil | Angular | 20.x |
| App Móvil | Android SDK | API 26+ (Android 8.0+) |
| Panel Web | Angular | 21.x |
| API Gateway | Node.js + Express | 20.x / 4.x |
| API Gateway | PostgreSQL (pg) | 16.x |
| API Gateway | JWT (jsonwebtoken) | 9.x |
| Microservicio IA | Python + Flask | 3.11 / 3.x |
| Microservicio IA | Scikit-Learn + XGBoost | 1.5+ / 2.x |
| Microservicio IA | Librosa | 0.10+ |
| Base de Datos | PostgreSQL | 16 |
| Despliegue | Render.com | — |

---

## Requisitos Previos

Asegúrate de tener instalado en tu entorno de desarrollo:

- **Git** >= 2.x
- **Node.js** >= 20.x y **npm** >= 10.x
- **Python** >= 3.10 (recomendado 3.11)
- **Angular CLI** >= 21.x → `npm install -g @angular/cli`
- **Ionic CLI** >= 7.x → `npm install -g @ionic/cli`
- **PostgreSQL** >= 16.x (cliente `psql` disponible en PATH)
- *(Opcional para APK)* **Android Studio** con SDK API 26+

---

## Instalación y Configuración Local

### Clonar el Repositorio

```bash
git clone https://github.com/Obed-c-v/S-PARK-.git
cd S-PARK-
```

---

### 1. Base de Datos (PostgreSQL)

Crea una base de datos local y restaura el esquema con datos de prueba:

```bash
# Crear la base de datos
createdb s_park_db

# Restaurar el esquema completo
psql -U <TU_USUARIO_PG> -d s_park_db -f s-park-oficial.sql
```

> El archivo `s-park-oficial.sql` contiene el esquema DDL completo (tablas, índices, relaciones) y datos semilla necesarios para el funcionamiento del sistema.

---

### 2. Microservicio de IA (Python Flask)

```bash
cd ml

# (Recomendado) Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el microservicio localmente
python app.py
```

El microservicio quedará disponible en: `http://localhost:5000`

**Dependencias principales:** Flask, Librosa, Scikit-Learn, XGBoost, Pandas, NumPy, SciPy.

---

### 3. API Gateway (Node.js / Express)

```bash
cd backend/S_park_api

# Instalar dependencias
npm install

# Configurar variables de entorno (ver sección Variables de Entorno)
# Edita el archivo .env con tus valores locales

# Modo desarrollo (con hot-reload via nodemon)
npm run dev

# Modo producción
npm start
```

La API quedará disponible en: `http://localhost:3000`

La documentación Swagger se puede consultar en: `http://localhost:3000/api-docs`

---

### 4. Panel Web Clínico (Angular)

```bash
cd frontend

# Instalar dependencias
npm install --legacy-peer-deps

# Servidor de desarrollo
npm start
# o bien:
ng serve
```

El panel web quedará disponible en: `http://localhost:4200`

**Build de producción:**

```bash
ng build --configuration production
# Los archivos estáticos se generan en: dist/S-park/browser/
```

---

### 5. App Móvil (Ionic / Capacitor)

```bash
cd frontend-movil-ionic

# Instalar dependencias
npm install

# Servidor de desarrollo (modo web)
ionic serve
# o:
npm start
```

La app estará disponible en: `http://localhost:8100`

**Compilar APK para Android:**

```bash
# Build de la aplicación web
ionic build

# Sincronizar con la capa nativa de Android
npx cap sync android

# Abrir Android Studio para compilar el APK
npx cap open android
```

> En Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
> El APK de depuración se encontrará en: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Variables de Entorno

### Backend (`backend/S_park_api/.env`)

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/s_park_db

# Secreto JWT (usa una cadena larga y aleatoria en producción)
JWT_SECRET=tu_jwt_secret_muy_seguro

# URL del Microservicio de IA
FLASK_API_URL=http://localhost:5000
ML_API_URL=http://localhost:5000

# Configuración de correo electrónico (para alertas clínicas)
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USER=onboarding@resend.dev
MAIL_PASS=tu_api_key_de_resend

# Puerto del servidor
PORT=3000
```

### Frontend Web (`frontend/src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  serverUrl: 'http://localhost:3000',
};
```

### App Móvil

Edita la URL de la API en el servicio de entorno correspondiente en `frontend-movil-ionic/src/environments/` para apuntar a tu backend local o de producción.

---

## Despliegue en Producción (Render)

El proyecto incluye un archivo `render.yaml` para despliegue automatizado en [Render.com](https://render.com):

```bash
# Simplemente conecta el repositorio en Render.
# El archivo render.yaml define automáticamente:
#   - spark-ia         → Microservicio Flask (Python)
#   - spark-backend    → API Gateway (Node.js)
#   - spark-frontend   → Panel Web estático (Angular)
#   - spark-db         → Base de datos PostgreSQL 16
```

**URLs de Producción oficiales:**
- 💻 **Panel Web Clínico (Frontend):** [https://spark-frontend-rigv.onrender.com](https://spark-frontend-rigv.onrender.com)
- 🌐 **API Gateway (Backend REST):** [https://spark-backend-sk78.onrender.com](https://spark-backend-sk78.onrender.com)
- 🧠 **Microservicio IA (Flask):** [https://spark-ia.onrender.com](https://spark-ia.onrender.com)

> **Nota:** En el plan gratuito de Render, los servicios web entran en estado de "sleep" tras inactividad. El primer request puede tardar ~30–60 segundos (cold start). El cliente ya tiene configurado un timeout de 60 segundos para mitigar esto.

---

## Credenciales de Prueba

El sistema inicializa automáticamente las siguientes cuentas de acceso al arrancar con una base de datos vacía:

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@spark.com` | `admin123` |
| Paciente | `paciente@spark.com` | `paciente123` |

> **Importante:** Cambia estas credenciales antes de cualquier despliegue en un entorno público o de producción real.

---

## Estructura del Repositorio

```
S-PARK-/
├── backend/
│   └── S_park_api/             # API Gateway Node.js / Express
│       ├── src/
│       │   ├── config/         # Configuración DB, inicialización automática
│       │   ├── routes/         # Rutas REST (usuarios, pacientes, evaluaciones...)
│       │   ├── middleware/     # Auth JWT, RBAC, rate limiting
│       │   └── utils/          # Helpers (hash, mailer, validadores)
│       ├── s-park-oficial.sql  # Dump completo de PostgreSQL
│       └── package.json
│
├── frontend/                   # Panel Web Clínico (Angular 21)
│   ├── src/
│   │   ├── app/                # Componentes, servicios, módulos Angular
│   │   └── environments/       # Configuración por entorno
│   └── package.json
│
├── frontend-movil-ionic/       # App Móvil para Pacientes (Ionic + Capacitor)
│   ├── src/
│   │   ├── app/                # Páginas, componentes, servicios Ionic
│   │   └── environments/
│   ├── android/                # Proyecto nativo Android (Capacitor)
│   └── package.json
│
├── ml/                         # Microservicio de IA (Python Flask)
│   ├── app.py                  # Servidor Flask principal
│   ├── models/                 # Modelos entrenados (.pkl / .joblib)
│   ├── train_rf.py             # Entrenamiento Random Forest
│   ├── train_xgb.py            # Entrenamiento XGBoost
│   ├── train_gb.py             # Entrenamiento Gradient Boosting
│   ├── train_svm.py            # Entrenamiento SVM
│   └── requirements.txt        # Dependencias Python
│
├── s-park-oficial.sql          # Backup completo de la base de datos
├── render.yaml                 # Configuración de despliegue en Render
└── README.md                   # Documentación técnica del proyecto
```

---

## Historial de Versiones

### v1.0.0 — Release Oficial (Septiembre 2026)

- ✅ App Móvil Ionic 7 con captura vocal, historial y gamificación
- ✅ Panel Web Angular 21 con expedientes clínicos y gráficas de biomarcadores (Jitter, Shimmer, HNR)
- ✅ API REST con JWT, RBAC, Swagger y rate limiting
- ✅ Microservicio IA con Random Forest (94.8% accuracy) y análisis bioacústico Librosa
- ✅ Despliegue completo en Render + PostgreSQL 16
- ✅ Sistema de alertas clínicas automáticas por email (Resend SMTP)
- ✅ Inicialización automática de base de datos al primer arranque

**Fixes de estabilización incluidos:**
- Timeout HTTP extendido a 60 s para cold starts en Render
- Normalización de formatos de audio WebM/WAV para compatibilidad con Librosa
- Optimización de connection pooling en PostgreSQL 16
- Validación estricta de asignación obligatoria de médico responsable

---

## Archivos Ejecutables / Paquetes de Despliegue

| Artefacto | Descripción | Ubicación |
|---|---|---|
| **APK Android (Ejecutable)** | Paquete de instalación para Android 8.0+ | [Descargar S-Park-v1.0.0.apk](https://github.com/Obed-c-v/S-PARK-/releases/download/v1.0.0/S-Park-v1.0.0.apk) · [Ver Release Oficial v1.0.0](https://github.com/Obed-c-v/S-PARK-/releases/tag/v1.0.0) |
| **Build Web** | Archivos estáticos del panel web | Generado con `ng build` (`dist/S-park/browser/`) |
| **SQL Dump** | Esquema y datos de la base de datos | [`s-park-oficial.sql`](./s-park-oficial.sql) |
| **Modelos ML** | Modelos entrenados en formato joblib | [`ml/models/`](./ml/models/) |

> 📱 El ejecutable APK para Android está publicado formalmente en la sección de **[Releases](https://github.com/Obed-c-v/S-PARK-/releases)** del repositorio para su descarga e instalación inmediata sin requerir compilación local.

---

## Autor

**Obed C. V.**
Repositorio: [https://github.com/Obed-c-v/S-PARK-](https://github.com/Obed-c-v/S-PARK-)

---

> Para consultas técnicas o revisión del código fuente, el repositorio está configurado con acceso de colaborador para el asesor técnico asignado.
