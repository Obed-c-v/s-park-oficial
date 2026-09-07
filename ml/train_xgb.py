"""
=============================================================
  S-Park - Entrenamiento y Evaluación: XGBoost ⚡
=============================================================
  Entrena XGBoost en:
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
from xgboost import XGBClassifier
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
print("  ENTRENANDO MODELO XGBOOST (OXFORD AUMENTADO)...")
print("=" * 60)

train_path = os.path.join(DATA_DIR, "oxford_train_augmented.csv")
test_path = os.path.join(DATA_DIR, "oxford_test_real.csv")

df_train = pd.read_csv(train_path)
df_test = pd.read_csv(test_path)

X_train = df_train.drop(columns=['status'])
y_train = df_train['status']

X_test = df_test.drop(columns=['status'])
y_test = df_test['status']

scaler = joblib.load(os.path.join(MODELS_DIR, "scaler_oxford.joblib"))
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)

xgb_model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    eval_metric='logloss',
    random_state=42
)
xgb_model.fit(X_train_scaled, y_train)

y_pred = xgb_model.predict(X_test_scaled)
y_prob = xgb_model.predict_proba(X_test_scaled)[:, 1]

acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
loss = log_loss(y_test, y_prob)
auc = roc_auc_score(y_test, y_prob)

print("\n📈 MÉTRICAS DE EVALUACIÓN EN TEST SET REAL (XGBOOST):")
print(f"   - Exactitud (Accuracy): {acc:.4f}")
print(f"   - Precisión:            {prec:.4f}")
print(f"   - Sensibilidad (Recall):{rec:.4f}")
print(f"   - F1-Score:             {f1:.4f}")
print(f"   - Log Loss:             {loss:.4f}")
print(f"   - AUC-ROC:              {auc:.4f}")

joblib.dump(xgb_model, os.path.join(MODELS_DIR, "xgb_model.joblib"))

plt.figure(figsize=(6, 5))
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Purples',
            xticklabels=['Sano', 'Parkinson'], yticklabels=['Sano', 'Parkinson'])
plt.title("Matriz de Confusión XGBoost (Oxford Real Test)")
plt.ylabel("Valor Real")
plt.xlabel("Predicción")
plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "oxford_confusion_xgb.png"), dpi=150)
plt.close()

print("[ÉXITO] Modelo XGBoost guardado en models/xgb_model.joblib")
