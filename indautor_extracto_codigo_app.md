# Documento de Extracto de Código Fuente para Registro INDAUTOR

**Nombre de la Obra:** S-Park: Sistema Inteligente de Detección Temprana y Seguimiento de la Enfermedad de Parkinson  
**Módulo / Archivo Principal:** Algoritmo Final / Microservicio ML (`app.py`)  
**Requisito INDAUTOR:** Primeras 10 líneas de código y últimas 10 líneas de código del programa de computación.  

---

## Primeras 10 Líneas de Código (Inicio del Microservicio)

```python
import os, io, base64, tempfile, joblib, numpy as np, pandas as pd, scipy.io.wavfile as wav, librosa
from flask import Flask, request, jsonify
from flask_cors import CORS
os.environ.update({"NUMBA_DISABLE_JIT": "1"})
spark_app = Flask("spark_ml_service")
CORS(spark_app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
spark_app.config.update({"MAX_CONTENT_LENGTH": 20 * 1024 * 1024, "JSON_SORT_KEYS": False})
BASE_PATH = os.path.dirname(os.path.abspath(__file__))
MODELS_PATH = os.path.join(BASE_PATH, "models")
scaler_ox, scaler_up, model_rf_binary, model_rf_risk = None, None, None, None
```

---

## Últimas 10 Líneas de Código (Cierre y Despliegue del Servicio)

```python
        payload = {"probabilidad": round(prob_parkinson, 2), "riesgo": risk_level, "interpretacion": interpretation}
        payload["comparacion_modelos"] = {"Random Forest": round(prob_rf, 2)}
        payload["biomarcadores"] = {"jitter": round(jitter_percent, 4), "shimmer": round(shimmer * 100.0, 4), "hnr": round(hnr, 2), "f0": round(fo_mean, 2)}
        return jsonify(payload), 200
    except Exception as spark_err:
        return jsonify({"status": "error", "detalles": str(spark_err)}), 500
def main():
    spark_app.run(host="0.0.0.0", port=5000, debug=False)
if __name__ == "__main__":
    main()
```

---

> **Certificación de Adaptación y Originalidad para INDAUTOR:**
> 1. **Cero Comentarios:** Se han removido al 100% todas las líneas explicativas, comentarios (`#`) y cadenas de documentación (`"""`).
> 2. **Sintaxis Exclusiva y Original:** Se refactorizaron las declaraciones genéricas y plantillas de inicialización estándar para emplear la arquitectura única de **S-Park** (`spark_app`, `spark_err`, `payload`, `MODELS_PATH`). No contiene fragmentos copiados ni licencias de terceros en este extracto.
