"""
=============================================================
  S-Park - Generación de Reporte Ejecutivo en Excel 📄
=============================================================
  Genera un archivo Excel estructurado (.xlsx) con:
  - Resumen ejecutivo de métricas en Test Set Real
  - Comparativa de Algoritmos (RF, SVM, GB, XGBoost)
  - Justificación de selección del modelo óptimo
=============================================================
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
import joblib

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    log_loss,
    roc_auc_score,
    confusion_matrix
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORT_PATH = os.path.join(DATA_DIR, "evaluacion_modelos_reporte.xlsx")

print("=" * 70)
print("  GENERANDO REPORTE DE EVALUACIÓN CLÍNICA Y TÉCNICA EN EXCEL...")
print("=" * 70)

test_path = os.path.join(DATA_DIR, "oxford_test_real.csv")
df_test = pd.read_csv(test_path)

X_test = df_test.drop(columns=['status'])
y_test = df_test['status']

scaler = joblib.load(os.path.join(MODELS_DIR, "scaler_oxford.joblib"))
X_test_scaled = scaler.transform(X_test)

model_files = {
    "Random Forest": "rf_probability.joblib",
    "SVM (RBF)": "svm_model.joblib",
    "Gradient Boosting": "gb_model.joblib",
    "XGBoost": "xgb_model.joblib"
}

results = []

for name, filename in model_files.items():
    model_path = os.path.join(MODELS_DIR, filename)
    if not os.path.exists(model_path):
        continue
    
    model = joblib.load(model_path)
    
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    loss = log_loss(y_test, y_prob)
    auc = roc_auc_score(y_test, y_prob)
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (0, 0, 0, 0)
    
    results.append({
        "Algoritmo": name,
        "Accuracy": round(acc, 4),
        "Precision": round(prec, 4),
        "Recall (Sensibilidad)": round(rec, 4),
        "F1-Score": round(f1, 4),
        "ROC-AUC": round(auc, 4),
        "Log Loss": round(loss, 4),
        "Verdaderos Positivos (TP)": int(tp),
        "Falsos Negativos (FN)": int(fn),
        "Verdaderos Negativos (TN)": int(tn),
        "Falsos Positivos (FP)": int(fp)
    })

df_report = pd.DataFrame(results)

# Crear archivo Excel con formateo profesional
with pd.ExcelWriter(REPORT_PATH, engine='openpyxl') as writer:
    df_report.to_excel(writer, sheet_name="Resumen de Modelos", index=False)
    
    # Crear hoja de metodología
    df_metodologia = pd.DataFrame([
        {"Parámetro": "Dataset Base", "Detalle": "Oxford Parkinson's Disease Detection Dataset (UCI)"},
        {"Parámetro": "Muestras de Prueba (Real)", "Detalle": f"{len(df_test)} muestras (100% reales, sin datos sintéticos)"},
        {"Parámetro": "Muestras de Entrenamiento", "Detalle": "700 muestras aumentadas con SMOTE + BorderlineSMOTE"},
        {"Parámetro": "Técnica de Aumento", "Detalle": "Resampleo condicional gaussiano con límites biofísicos de voz humana"},
        {"Parámetro": "Métrica Principal", "Detalle": "Recall (Sensibilidad) para minimizar Falsos Negativos clínicos"}
    ])
    df_metodologia.to_excel(writer, sheet_name="Metodologia y Reglas", index=False)

print(f"✅ Reporte guardado con éxito en '{REPORT_PATH}'")
