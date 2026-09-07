"""
=============================================================
  S-Park - Entrenamiento y Evaluación: Random Forest 🌲
=============================================================
  Entrena el modelo de Bosque Aleatorio enfocado exclusivamente en:
  - Clasificación Binaria (Oxford Aumentado): Detectar Parkinson (Sano vs Enfermo)
  - Entrenamiento: oxford_train_augmented.csv (Sintético + Real)
  - Evaluación: oxford_test_real.csv (100% Real - No Data Leakage)
=============================================================
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    log_loss,
    roc_auc_score
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

print("=" * 60)
print("  ENTRENANDO MODELO RANDOM FOREST (OXFORD AUMENTADO)...")
print("=" * 60)

# PASO 1: CARGAR DATASETS
train_path = os.path.join(DATA_DIR, "oxford_train_augmented.csv")
test_path = os.path.join(DATA_DIR, "oxford_test_real.csv")

if not os.path.exists(train_path) or not os.path.exists(test_path):
    print("⚠️ No se encontraron los datasets aumentados. Ejecutando generador sintético primero...")
    import generate_synthetic_oxford
    df_ox = generate_synthetic_oxford.cargar_dataset_oxford()
    X_tr, X_te, y_tr, y_te = generate_synthetic_oxford.separar_train_test(df_ox)
    df_aug = generate_synthetic_oxford.generar_datos_sinteticos(X_tr, y_tr)
    generate_synthetic_oxford.exportar_datasets(df_aug, X_te, y_te)

df_train = pd.read_csv(train_path)
df_test = pd.read_csv(test_path)

X_train = df_train.drop(columns=['status'])
y_train = df_train['status']

X_test = df_test.drop(columns=['status'])
y_test = df_test['status']

print(f"[OK] Train set (Aumentado): {X_train.shape[0]} muestras")
print(f"[OK] Test set (100% Real):  {X_test.shape[0]} muestras")

# PASO 2: ESCALAMIENTO DE CARACTERÍSTICAS
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler_oxford.joblib"))

# PASO 3: ENTRENAMIENTO DE RANDOM FOREST
rf_model = RandomForestClassifier(
    n_estimators=150,
    max_depth=10,
    class_weight='balanced',
    random_state=42
)
rf_model.fit(X_train_scaled, y_train)

# PASO 4: EVALUACIÓN EN TEST SET REAL
y_pred = rf_model.predict(X_test_scaled)
y_prob = rf_model.predict_proba(X_test_scaled)[:, 1]

acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
loss = log_loss(y_test, y_prob)
auc = roc_auc_score(y_test, y_prob)

print("\n📈 MÉTRICAS DE EVALUACIÓN EN TEST SET REAL:")
print(f"   - Exactitud (Accuracy): {acc:.4f}")
print(f"   - Precisión:            {prec:.4f}")
print(f"   - Sensibilidad (Recall):{rec:.4f}")
print(f"   - F1-Score:             {f1:.4f}")
print(f"   - Log Loss:             {loss:.4f}")
print(f"   - AUC-ROC:              {auc:.4f}")

# PASO 5: GUARDAR MODELO Y DIAGNÓSTICO
joblib.dump(rf_model, os.path.join(MODELS_DIR, "rf_probability.joblib"))

plt.figure(figsize=(10, 4))

# Matriz de Confusión
plt.subplot(1, 2, 1)
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Sano', 'Parkinson'], yticklabels=['Sano', 'Parkinson'])
plt.title("Matriz de Confusión RF (Oxford Real Test)")
plt.ylabel("Valor Real")
plt.xlabel("Predicción")

# Importancia de Variables
importances = rf_model.feature_importances_
indices = np.argsort(importances)[::-1][:10]
features = X_train.columns.values

plt.subplot(1, 2, 2)
sns.barplot(x=importances[indices], y=features[indices], hue=features[indices], palette="viridis", legend=False)
plt.title("Top 10 Biomarcadores RF")
plt.xlabel("Importancia")

plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "oxford_confusion_rf.png"), dpi=150)
plt.close()

print("[ÉXITO] Modelo Random Forest guardado en models/rf_probability.joblib")
