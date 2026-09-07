"""
=============================================================
  S-Park - Comparación General de Modelos de IA 📊
=============================================================
  Compara los 4 algoritmos (Random Forest, SVM, Gradient Boosting, XGBoost)
  entrenados en el dataset de Oxford Aumentado y evaluados en X_test_real.
=============================================================
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    log_loss,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "models")

print("=" * 70)
print("  EVALUANDO Y COMPARANDO TODOS LOS MODELOS EN TEST SET REAL...")
print("=" * 70)

# PASO 1: CARGAR DATASET TEST REAL
test_path = os.path.join(DATA_DIR, "oxford_test_real.csv")
df_test = pd.read_csv(test_path)

X_test = df_test.drop(columns=['status'])
y_test = df_test['status']

# Cargar escalador
scaler = joblib.load(os.path.join(MODELS_DIR, "scaler_oxford.joblib"))
X_test_scaled = scaler.transform(X_test)

# PASO 2: CARGAR MODELOS
model_files = {
    "Random Forest": "rf_probability.joblib",
    "SVM (RBF)": "svm_model.joblib",
    "Gradient Boosting": "gb_model.joblib",
    "XGBoost": "xgb_model.joblib"
}

results = []

plt.figure(figsize=(8, 6))

for name, filename in model_files.items():
    model_path = os.path.join(MODELS_DIR, filename)
    if not os.path.exists(model_path):
        print(f"⚠️ Modelo {name} no encontrado en {model_path}. Por favor entra {filename} primero.")
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
    
    results.append({
        "Modelo": name,
        "Accuracy": acc,
        "Precision": prec,
        "Recall": rec,
        "F1-Score": f1,
        "Log Loss": loss,
        "ROC-AUC": auc
    })
    
    # Curva ROC
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    plt.plot(fpr, tpr, label=f"{name} (AUC = {auc:.3f})", lw=2)

plt.plot([0, 1], [0, 1], 'k--', lw=1.5, label="Aleatorio")
plt.xlabel("Tasa de Falsos Positivos (FPR)")
plt.ylabel("Tasa de Verdaderos Positivos (Recall / TPR)")
plt.title("Curvas ROC - Comparación de Modelos de Detección de Parkinson")
plt.legend(loc="lower right")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "oxford_roc_curves.png"), dpi=150)
plt.close()

df_results = pd.DataFrame(results)

print("\n" + "=" * 70)
print("  TABLA COMPARATIVA DE RENDIMIENTO (TEST SET REAL):")
print("=" * 70)
print(df_results.to_string(index=False))

# Exportar a CSV
df_results.to_csv(os.path.join(DATA_DIR, "comparacion_modelos.csv"), index=False)
print(f"\n[OK] Resultados exportados a '{os.path.join(DATA_DIR, 'comparacion_modelos.csv')}'")
