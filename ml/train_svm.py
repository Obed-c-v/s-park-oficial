"""
=============================================================
  S-Park - Entrenamiento y Evaluacion: SVM (Support Vector Machine)
=============================================================
  Este script entrena dos modelos de Maquina de Vectores de Soporte:
  1. Clasificador Binario (Oxford): Detectar Parkinson (Sano vs Enfermo)
  2. Clasificador Multiclase (UPDRS): Nivel de Riesgo (Bajo, Medio, Alto)

  DIFERENCIA CON RANDOM FOREST:
  Mientras que Random Forest construye decenas de arboles de decision en
  paralelo y los hace votar, SVM busca la LINEA (o hiperplano en varias
  dimensiones) que separa MEJOR a los grupos con el MAYOR MARGEN posible.
  Para datos no lineales (como los biomarcadores de voz), usa un KERNEL
  RBF que proyecta los datos a un espacio de mayor dimension donde
  la separacion si es posible de forma lineal.
=============================================================
"""

import pandas as pd
import numpy as np
import os
import matplotlib
matplotlib.use('Agg')  # Evitar errores de interfaz grafica en Windows
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# Importaciones de Scikit-learn
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC  # <-- SVC = Support Vector Classifier

# Metricas de evaluacion
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
print("  ENTRENANDO MODELOS SVM paso a paso...")
print("=" * 60)

# ============================================================
# PASO 1: CARGA DE LOS DATASETS LIMPIOS Y HISTORIAL DE PRUEBAS
# ============================================================
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

print(f"Dataset Oxford cargado (con historial): {df_oxford.shape[0]} filas x {df_oxford.shape[1]} columnas")
print(f"Dataset UPDRS cargado:  {df_updrs.shape[0]} filas x {df_updrs.shape[1]} columnas")


# ============================================================
# PASO 2: SEPARACION DE VARIABLES Y PARTICION TRAIN/TEST
# ============================================================
print("\n--- PASO 2: Division en Entrenamiento (80%) y Prueba (20%) ---")

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

print(f"Oxford Split -> Train: {X_train_ox.shape[0]} muestras, Test: {X_test_ox.shape[0]} muestras")
print(f"UPDRS Split  -> Train: {X_train_up.shape[0]} muestras, Test: {X_test_up.shape[0]} muestras")


# ============================================================
# PASO 3: ESCALAMIENTO (MUY IMPORTANTE PARA SVM)
# ============================================================
print("\n--- PASO 3: Escalamiento de Caracteristicas ---")
# A diferencia de Random Forest, SVM ES EXTREMADAMENTE SENSIBLE a la
# escala de los datos. Si Jitter mide 0.003 y la frecuencia Fo(Hz)
# mide 150, SVM le dara mucho mas peso a la frecuencia por el solo hecho
# de ser un numero mas grande, aunque no sea mas importante.
# SOLUCION: StandardScaler lleva todos los datos a una escala comun
# centrada en 0 con varianza 1.
# IMPORTANTE: Reutilizamos los escaladores guardados por train_rf.py
# para garantizar que SVM vea los datos con la MISMA escala que RF.

scaler_ox = joblib.load(os.path.join(MODELS_DIR, "scaler_oxford.joblib"))
scaler_up = joblib.load(os.path.join(MODELS_DIR, "scaler_updrs.joblib"))

X_train_ox_scaled = scaler_ox.transform(X_train_ox)
X_test_ox_scaled = scaler_ox.transform(X_test_ox)

X_train_up_scaled = scaler_up.transform(X_train_up)
X_test_up_scaled = scaler_up.transform(X_test_up)

print("Escaladores existentes cargados y datos normalizados.")


# ============================================================
# PASO 4: MODELO 1 - SVM BINARIO (Oxford: Deteccion de Parkinson)
# ============================================================
print("\n" + "=" * 60)
print("  ENTRENANDO MODELO 1: SVM BINARIO")
print("=" * 60)

# Hiperparametros clave de SVM:
# - kernel='rbf': Radial Basis Function (Funcion de Base Radial). Proyecta
#   los datos a una dimension mayor donde la separacion es lineal. Es el
#   kernel estandar para datos biologicos/medicos no lineales como la voz.
# - C=10: Parametro de regularizacion. Controla el margen del hiperplano.
#   Un C alto = mas ajustado a los datos (puede sobreajustar).
#   Un C bajo = margen mas amplio y menos sensible a outliers.
# - gamma='scale': Controla el radio de influencia de cada punto de datos.
#   'scale' = 1 / (n_features * X.var()), es la opcion recomendada.
# - probability=True: NECESARIO para poder calcular AUC-ROC y Log Loss.
#   Activa el calculo de probabilidades usando validacion cruzada interna.
#   Hace el entrenamiento un poco mas lento pero es esencial para metricas.
# - class_weight='balanced': Compensa el desbalance de clases igual que RF.

svm_binary = SVC(
    kernel='rbf',
    C=10,
    gamma='scale',
    probability=True,
    class_weight='balanced',
    random_state=42
)

print("Entrenando SVM Binario (puede tomar unos segundos mas que RF)...")
svm_binary.fit(X_train_ox_scaled, y_train_ox)
print("Modelo entrenado exitosamente.")

# Predicciones
y_pred_ox = svm_binary.predict(X_test_ox_scaled)
y_prob_ox = svm_binary.predict_proba(X_test_ox_scaled)[:, 1]

# Metricas
acc_ox = accuracy_score(y_test_ox, y_pred_ox)
prec_ox = precision_score(y_test_ox, y_pred_ox)
rec_ox = recall_score(y_test_ox, y_pred_ox)
f1_ox = f1_score(y_test_ox, y_pred_ox)
loss_ox = log_loss(y_test_ox, y_prob_ox)
auc_ox = roc_auc_score(y_test_ox, y_prob_ox)

print("\nMETRICAS DE EVALUACION (TEST):")
print(f"   - Exactitud (Accuracy): {acc_ox:.4f}")
print(f"   - Precision:            {prec_ox:.4f}")
print(f"   - Sensibilidad (Recall):{rec_ox:.4f}")
print(f"   - F1-Score:             {f1_ox:.4f}")
print(f"   - Log Loss:             {loss_ox:.4f}")
print(f"   - AUC-ROC:              {auc_ox:.4f}")


# ============================================================
# PASO 5: MODELO 2 - SVM MULTICLASE (UPDRS: Nivel de Riesgo)
# ============================================================
print("\n" + "=" * 60)
print("  ENTRENANDO MODELO 2: SVM BINARIO (Riesgo)")
print("=" * 60)

svm_multiclass = SVC(
    kernel='rbf',
    C=10,
    gamma='scale',
    probability=True,
    class_weight='balanced',
    random_state=42
)

print("Entrenando SVM Binario (Riesgo) (dataset grande, puede tardar ~30 seg)...")
svm_multiclass.fit(X_train_up_scaled, y_train_up)
print("Modelo entrenado exitosamente.")

# Predicciones
y_pred_up = svm_multiclass.predict(X_test_up_scaled)
y_prob_up = svm_multiclass.predict_proba(X_test_up_scaled)[:, 1]

# Metricas
acc_up = accuracy_score(y_test_up, y_pred_up)
prec_up = precision_score(y_test_up, y_pred_up)
rec_up = recall_score(y_test_up, y_pred_up)
f1_up = f1_score(y_test_up, y_pred_up)
loss_up = log_loss(y_test_up, svm_multiclass.predict_proba(X_test_up_scaled))
auc_up = roc_auc_score(y_test_up, y_prob_up)

print("\nMETRICAS DE EVALUACION (TEST):")
print(f"   - Exactitud (Accuracy): {acc_up:.4f}")
print(f"   - Precision:            {prec_up:.4f}")
print(f"   - Sensibilidad (Recall):{rec_up:.4f}")
print(f"   - F1-Score:             {f1_up:.4f}")
print(f"   - Log Loss:             {loss_up:.4f}")
print(f"   - AUC-ROC:              {auc_up:.4f}")


# ============================================================
# PASO 6: GUARDAR MODELOS Y GRAFICAS
# ============================================================
print("\n--- PASO 6: Guardando modelos y matrices de confusion ---")

# Guardar modelos
joblib.dump(svm_binary, os.path.join(MODELS_DIR, "svm_probability.joblib"))
joblib.dump(svm_multiclass, os.path.join(MODELS_DIR, "svm_risk.joblib"))
print("Modelos SVM guardados en la carpeta 'models/'")

# Matrices de Confusion
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Oxford
cm_ox = confusion_matrix(y_test_ox, y_pred_ox)
sns.heatmap(cm_ox, annot=True, fmt='d', cmap='Oranges', ax=axes[0],
            xticklabels=['Sano', 'Parkinson'], yticklabels=['Sano', 'Parkinson'])
axes[0].set_title("SVM - Confusion Matrix (Oxford Binaria)")
axes[0].set_ylabel("Valor Real")
axes[0].set_xlabel("Prediccion")

# UPDRS
cm_up = confusion_matrix(y_test_up, y_pred_up)
sns.heatmap(cm_up, annot=True, fmt='d', cmap='Reds', ax=axes[1],
            xticklabels=['Bajo', 'Alto'], yticklabels=['Bajo', 'Alto'])
axes[1].set_title("SVM - Confusion Matrix (UPDRS Riesgo Binario)")
axes[1].set_ylabel("Valor Real")
axes[1].set_xlabel("Prediccion")

plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "svm_confusion_matrices.png"), dpi=150)
plt.close()
print("Grafico de matrices de confusion guardado en 'outputs/svm_confusion_matrices.png'")

print("\n===================================================")
print("  PROCESO DE SVM COMPLETADO CON EXITO!")
print("===================================================")
print("Puedes ejecutar este script desde tu terminal con:")
print("python train_svm.py")
