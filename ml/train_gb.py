"""
=============================================================
  S-Park - Entrenamiento y Evaluacion: Gradient Boosting
=============================================================
  Este script entrena dos modelos de Gradient Boosting:
  1. Clasificador Binario (Oxford): Detectar Parkinson (Sano vs Enfermo)
  2. Clasificador Multiclase (UPDRS): Nivel de Riesgo (Bajo, Medio, Alto)
=============================================================
"""

import pandas as pd
import numpy as np
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    log_loss,
    roc_auc_score
)

# Definicion de rutas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

print("=" * 60)
print("  ENTRENANDO MODELOS GRADIENT BOOSTING...")
print("=" * 60)

# PASO 1: CARGA DE LOS DATASETS LIMPIOS Y HISTORIAL DE PRUEBAS
print("\n--- PASO 1: Cargando datasets limpios ---")
df_oxford = pd.read_csv(os.path.join(DATA_DIR, "oxford_clean.csv"))
df_updrs = pd.read_csv(os.path.join(DATA_DIR, "updrs_clean.csv"))

# Cargar historial de pruebas si existe para incorporarlo al entrenamiento
historial_path = os.path.join(DATA_DIR, "pruebas_historial.csv")
if os.path.exists(historial_path):
    try:
        df_historial = pd.read_csv(historial_path)
        # Filtrar registros corruptos (donde MDVP:Fo(Hz) sea 0 o nulo)
        df_historial = df_historial[df_historial['MDVP:Fo(Hz)'] > 0].dropna()
        if len(df_historial) > 0:
            cols_ox = list(df_oxford.columns)
            df_historial_filtered = df_historial[cols_ox]
            df_oxford = pd.concat([df_oxford, df_historial_filtered], ignore_index=True)
            print(f"[OK] Se incorporaron {len(df_historial_filtered)} registros historicos del endpoint al entrenamiento.")
    except Exception as e:
        print(f"[WARNING] No se pudo cargar o procesar el historial de pruebas: {e}")

# PASO 2: SEPARACION DE VARIABLES Y PARTICION TRAIN/TEST
print("\n--- PASO 2: Division Train/Test ---")
# Oxford (Binario)
X_ox = df_oxford.drop(columns=['status'])
y_ox = df_oxford['status']
X_train_ox, X_test_ox, y_train_ox, y_test_ox = train_test_split(
    X_ox, y_ox, test_size=0.2, random_state=42, stratify=y_ox
)

# UPDRS (Multiclase)
X_up = df_updrs.drop(columns=['nivel_riesgo'])
y_up = df_updrs['nivel_riesgo']
class_mapping = {'BAJO': 0, 'ALTO': 1}
y_up_encoded = y_up.map(class_mapping)

X_train_up, X_test_up, y_train_up, y_test_up = train_test_split(
    X_up, y_up_encoded, test_size=0.2, random_state=42, stratify=y_up_encoded
)

# PASO 3: ESCALAMIENTO
print("\n--- PASO 3: Normalización de datos ---")
scaler_ox = joblib.load(os.path.join(MODELS_DIR, "scaler_oxford.joblib"))
scaler_up = joblib.load(os.path.join(MODELS_DIR, "scaler_updrs.joblib"))

X_train_ox_scaled = scaler_ox.transform(X_train_ox)
X_test_ox_scaled = scaler_ox.transform(X_test_ox)
X_train_up_scaled = scaler_up.transform(X_train_up)
X_test_up_scaled = scaler_up.transform(X_test_up)

# PASO 4: MODELO 1 - GRADIENT BOOSTING BINARIO
print("\n" + "=" * 60)
print("  ENTRENANDO MODELO 1: GB BINARIO (Oxford)")
print("=" * 60)

# Gradient Boosting construye árboles de forma secuencial, donde cada nuevo
# árbol intenta corregir los errores cometidos por los árboles anteriores.
# Usamos parámetros equilibrados para evitar sobreajuste.
gb_binary = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)

gb_binary.fit(X_train_ox_scaled, y_train_ox)
y_pred_ox = gb_binary.predict(X_test_ox_scaled)
y_prob_ox = gb_binary.predict_proba(X_test_ox_scaled)[:, 1]

# Métricas
acc_ox = accuracy_score(y_test_ox, y_pred_ox)
prec_ox = precision_score(y_test_ox, y_pred_ox)
rec_ox = recall_score(y_test_ox, y_pred_ox)
f1_ox = f1_score(y_test_ox, y_pred_ox)
loss_ox = log_loss(y_test_ox, y_prob_ox)
auc_ox = roc_auc_score(y_test_ox, y_prob_ox)

print("\nMETRICAS GB BINARIO (TEST):")
print(f"   - Exactitud (Accuracy): {acc_ox:.4f}")
print(f"   - Precision:            {prec_ox:.4f}")
print(f"   - Sensibilidad (Recall):{rec_ox:.4f}")
print(f"   - F1-Score:             {f1_ox:.4f}")
print(f"   - Log Loss:             {loss_ox:.4f}")
print(f"   - AUC-ROC:              {auc_ox:.4f}")

# PASO 5: MODELO 2 - GRADIENT BOOSTING BINARIO (Riesgo)
print("\n" + "=" * 60)
print("  ENTRENANDO MODELO 2: GB BINARIO (Riesgo)")
print("=" * 60)

gb_multiclass = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)

print("Entrenando Gradient Boosting Binario (Riesgo)...")
gb_multiclass.fit(X_train_up_scaled, y_train_up)
y_pred_up = gb_multiclass.predict(X_test_up_scaled)
y_prob_up = gb_multiclass.predict_proba(X_test_up_scaled)[:, 1]

# Métricas
acc_up = accuracy_score(y_test_up, y_pred_up)
prec_up = precision_score(y_test_up, y_pred_up)
rec_up = recall_score(y_test_up, y_pred_up)
f1_up = f1_score(y_test_up, y_pred_up)
loss_up = log_loss(y_test_up, gb_multiclass.predict_proba(X_test_up_scaled))
auc_up = roc_auc_score(y_test_up, y_prob_up)

print("\nMETRICAS GB BINARIO (TEST):")
print(f"   - Exactitud (Accuracy): {acc_up:.4f}")
print(f"   - Precision:            {prec_up:.4f}")
print(f"   - Sensibilidad (Recall):{rec_up:.4f}")
print(f"   - F1-Score:             {f1_up:.4f}")
print(f"   - Log Loss:             {loss_up:.4f}")
print(f"   - AUC-ROC:              {auc_up:.4f}")

# PASO 6: GUARDAR MODELOS Y MATRICES DE CONFUSION
print("\n--- PASO 6: Guardando modelos y matrices de confusion ---")
joblib.dump(gb_binary, os.path.join(MODELS_DIR, "gb_probability.joblib"))
joblib.dump(gb_multiclass, os.path.join(MODELS_DIR, "gb_risk.joblib"))
print("Modelos Gradient Boosting guardados en la carpeta 'models/'")

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Oxford
cm_ox = confusion_matrix(y_test_ox, y_pred_ox)
sns.heatmap(cm_ox, annot=True, fmt='d', cmap='Oranges', ax=axes[0],
            xticklabels=['Sano', 'Parkinson'], yticklabels=['Sano', 'Parkinson'])
axes[0].set_title("GB - Confusion Matrix (Oxford Binaria)")
axes[0].set_ylabel("Valor Real")
axes[0].set_xlabel("Prediccion")

# UPDRS
cm_up = confusion_matrix(y_test_up, y_pred_up)
sns.heatmap(cm_up, annot=True, fmt='d', cmap='Reds', ax=axes[1],
            xticklabels=['Bajo', 'Alto'], yticklabels=['Bajo', 'Alto'])
axes[1].set_title("GB - Confusion Matrix (UPDRS Riesgo Binario)")
axes[1].set_ylabel("Valor Real")
axes[1].set_xlabel("Prediccion")

plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "gb_confusion_matrices.png"), dpi=150)
plt.close()
print("Matrices de confusión guardadas en 'outputs/gb_confusion_matrices.png'")
print("\n===================================================")
print("  PROCESO DE GRADIENT BOOSTING COMPLETADO CON EXITO!")
print("===================================================")
