import pandas as pd
import numpy as np
import os
import matplotlib
matplotlib.use('Agg')  # Evitar problemas de interfaz grafica
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    log_loss,
    roc_auc_score
)

# Definir directorios
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "models")

print("=" * 70)
print("       S-PARK: COMPARACION DE ALGORITMOS DE MACHINE LEARNING")
print("=" * 70)

# ==========================================
# 1. CARGA DE DATASETS Y REPRODUCCION DE SPLITS
# ==========================================
print("\n--- PASO 1: Cargando datasets de prueba ---")

# --- 1.1 Dataset Oxford (Deteccion Binaria) ---
df_oxford = pd.read_csv(os.path.join(DATA_DIR, "oxford_clean.csv"))
historial_path = os.path.join(DATA_DIR, "pruebas_historial.csv")
if os.path.exists(historial_path):
    try:
        df_historial = pd.read_csv(historial_path)
        df_historial = df_historial[df_historial['MDVP:Fo(Hz)'] > 0].dropna()
        if len(df_historial) > 0:
            cols_ox = list(df_oxford.columns)
            df_historial_filtered = df_historial[cols_ox]
            df_oxford = pd.concat([df_oxford, df_historial_filtered], ignore_index=True)
            print(f"[OK] Se incorporaron {len(df_historial_filtered)} registros historicos al dataset de Oxford.")
    except Exception as e:
        print(f"[WARNING] No se pudo incorporar el historial: {e}")

X_ox = df_oxford.drop(columns=['status'])
y_ox = df_oxford['status']
_, X_test_ox, _, y_test_ox = train_test_split(
    X_ox, y_ox, test_size=0.2, random_state=42, stratify=y_ox
)

# --- 1.2 Dataset UPDRS (Nivel de Riesgo Binario) ---
df_updrs = pd.read_csv(os.path.join(DATA_DIR, "updrs_clean.csv"))
X_up = df_updrs.drop(columns=['nivel_riesgo'])
y_up = df_updrs['nivel_riesgo']
class_mapping = {'BAJO': 0, 'ALTO': 1}
y_up_encoded = y_up.map(class_mapping)

_, X_test_up, _, y_test_up = train_test_split(
    X_up, y_up_encoded, test_size=0.2, random_state=42, stratify=y_up_encoded
)

print(f"[OK] Oxford test split: {len(X_test_ox)} muestras.")
print(f"[OK] UPDRS test split: {len(X_test_up)} muestras.")

# ==========================================
# 2. CARGA DE ESCALADORES Y MODELOS
# ==========================================
print("\n--- PASO 2: Cargando escaladores y modelos guardados ---")
try:
    scaler_ox = joblib.load(os.path.join(MODELS_DIR, "scaler_oxford.joblib"))
    scaler_up = joblib.load(os.path.join(MODELS_DIR, "scaler_updrs.joblib"))

    # Aplicar escaladores
    X_test_ox_scaled = scaler_ox.transform(X_test_ox)
    X_test_up_scaled = scaler_up.transform(X_test_up)

    models_binary = {
        "Random Forest": joblib.load(os.path.join(MODELS_DIR, "rf_probability.joblib")),
        "SVM": joblib.load(os.path.join(MODELS_DIR, "svm_probability.joblib")),
        "Gradient Boosting": joblib.load(os.path.join(MODELS_DIR, "gb_probability.joblib")),
        "XGBoost": joblib.load(os.path.join(MODELS_DIR, "xgb_probability.joblib"))
    }

    models_multiclass = {
        "Random Forest": joblib.load(os.path.join(MODELS_DIR, "rf_risk.joblib")),
        "SVM": joblib.load(os.path.join(MODELS_DIR, "svm_risk.joblib")),
        "Gradient Boosting": joblib.load(os.path.join(MODELS_DIR, "gb_risk.joblib")),
        "XGBoost": joblib.load(os.path.join(MODELS_DIR, "xgb_risk.joblib"))
    }
    print("[SUCCESS] Todos los modelos y escaladores cargados exitosamente.")
except Exception as e:
    print(f"[ERROR] No se pudieron cargar los modelos o escaladores: {e}")
    print("Asegurate de que los archivos .joblib existan en la carpeta ml/models/")
    exit(1)

# ==========================================
# 3. EVALUACION Y CALCULO DE METRICAS
# ==========================================

# --- 3.1 Deteccion Binaria (Oxford) ---
print("\n--- PASO 3: Evaluando modelos binarios (Deteccion de Parkinson) ---")
binary_results = []
binary_predictions = {}
binary_probabilities = {}

for name, model in models_binary.items():
    preds = model.predict(X_test_ox_scaled)
    probs = model.predict_proba(X_test_ox_scaled)[:, 1]
    
    binary_predictions[name] = preds
    binary_probabilities[name] = probs
    
    acc = accuracy_score(y_test_ox, preds)
    prec = precision_score(y_test_ox, preds)
    rec = recall_score(y_test_ox, preds)
    f1 = f1_score(y_test_ox, preds)
    loss = log_loss(y_test_ox, probs)
    auc = roc_auc_score(y_test_ox, probs)
    
    binary_results.append({
        "Algoritmo": name,
        "Exactitud (Acc)": acc,
        "Precision": prec,
        "Sensibilidad (Recall)": rec,
        "F1-Score": f1,
        "Log Loss": loss,
        "AUC-ROC": auc
    })

# Añadir Ensemble actual (Promedio / Voto Suave)
ensemble_probs = np.mean(list(binary_probabilities.values()), axis=0)
ensemble_preds = (ensemble_probs >= 0.5).astype(int)
binary_predictions["Ensemble (Soft Vote)"] = ensemble_preds

binary_results.append({
    "Algoritmo": "Ensemble (Soft Vote)",
    "Exactitud (Acc)": accuracy_score(y_test_ox, ensemble_preds),
    "Precision": precision_score(y_test_ox, ensemble_preds),
    "Sensibilidad (Recall)": recall_score(y_test_ox, ensemble_preds),
    "F1-Score": f1_score(y_test_ox, ensemble_preds),
    "Log Loss": log_loss(y_test_ox, ensemble_probs),
    "AUC-ROC": roc_auc_score(y_test_ox, ensemble_probs)
})

df_binary_metrics = pd.DataFrame(binary_results)

# --- 3.2 Nivel de Riesgo Binario (UPDRS) ---
print("--- PASO 4: Evaluando modelos binarios (Nivel de Riesgo UPDRS) ---")
multiclass_results = []
multiclass_predictions = {}
multiclass_probabilities = {}

for name, model in models_multiclass.items():
    preds = model.predict(X_test_up_scaled)
    probs = model.predict_proba(X_test_up_scaled)[:, 1]
    
    multiclass_predictions[name] = preds
    multiclass_probabilities[name] = probs
    
    acc = accuracy_score(y_test_up, preds)
    prec = precision_score(y_test_up, preds)
    rec = recall_score(y_test_up, preds)
    f1 = f1_score(y_test_up, preds)
    loss = log_loss(y_test_up, model.predict_proba(X_test_up_scaled))
    auc = roc_auc_score(y_test_up, probs)
    
    multiclass_results.append({
        "Algoritmo": name,
        "Exactitud (Acc)": acc,
        "Precision": prec,
        "Sensibilidad (Recall)": rec,
        "F1-Score": f1,
        "Log Loss": loss,
        "AUC-ROC": auc
    })

# Añadir Ensemble actual (Promedio / Voto Suave)
ensemble_multiclass_probs = np.mean([model.predict_proba(X_test_up_scaled)[:, 1] for model in models_multiclass.values()], axis=0)
ensemble_multiclass_preds = (ensemble_multiclass_probs >= 0.5).astype(int)
multiclass_predictions["Ensemble (Soft Vote)"] = ensemble_multiclass_preds

multiclass_results.append({
    "Algoritmo": "Ensemble (Soft Vote)",
    "Exactitud (Acc)": accuracy_score(y_test_up, ensemble_multiclass_preds),
    "Precision": precision_score(y_test_up, ensemble_multiclass_preds),
    "Sensibilidad (Recall)": recall_score(y_test_up, ensemble_multiclass_preds),
    "F1-Score": f1_score(y_test_up, ensemble_multiclass_preds),
    "Log Loss": log_loss(y_test_up, np.column_stack([1 - ensemble_multiclass_probs, ensemble_multiclass_probs])),
    "AUC-ROC": roc_auc_score(y_test_up, ensemble_multiclass_probs)
})

df_multiclass_metrics = pd.DataFrame(multiclass_results)

def print_beautiful_table(df, title, subtitle):
    # Formatear columnas
    df_formatted = df.copy()
    for col in df_formatted.columns:
        if df_formatted[col].dtype == 'float64':
            df_formatted[col] = df_formatted[col].map(lambda x: f"{x:.4f}")
        else:
            df_formatted[col] = df_formatted[col].map(str)
            
    # Obtener anchos
    headers = list(df_formatted.columns)
    widths = [len(h) for h in headers]
    for idx, col in enumerate(headers):
        max_len = df_formatted[col].map(len).max()
        if max_len > widths[idx]:
            widths[idx] = max_len
            
    # Linea separadora
    sep_line = "+" + "+".join(["-" * (w + 2) for w in widths]) + "+"
    
    # Imprimir cabecera de titulo
    border_len = len(sep_line)
    print("\n" + "=" * border_len)
    print(f"  {title}")
    print(f"  {subtitle}")
    print("=" * border_len)
    
    print(sep_line)
    # Encabezados de columna
    header_str = "|" + "|".join([f" {h:<{widths[i]}} " for i, h in enumerate(headers)]) + "|"
    print(header_str)
    print(sep_line)
    
    # Filas de datos
    for _, row in df_formatted.iterrows():
        row_str = "|" + "|".join([f" {row[h]:<{widths[i]}} " for i, h in enumerate(headers)]) + "|"
        print(row_str)
    print(sep_line)

print_beautiful_table(df_binary_metrics, "TABLA COMPARATIVA 1: DETECCION BINARIA (OXFORD)", "(Objetivo: Maximizar Sensibilidad/Recall sin arruinar F1-Score)")
print_beautiful_table(df_multiclass_metrics, "TABLA COMPARATIVA 2: NIVEL DE RIESGO BINARIO (UPDRS)", "(Objetivo: Maximizar Sensibilidad/Recall sin arruinar F1-Score)")

# ==========================================
# 5. GENERACION Y GUARDADO DE MATRICES DE CONFUSION
# ==========================================
print("\n--- PASO 5: Generando graficos de matrices de confusion ---")

# --- 5.1 Matriz de Confusion Oxford (Binario) ---
fig_ox, axes_ox = plt.subplots(2, 2, figsize=(12, 10))
axes_ox = axes_ox.ravel()
cm_colormaps_ox = ['Blues', 'Oranges', 'Greens', 'Purples']

for i, (name, model) in enumerate(models_binary.items()):
    preds = binary_predictions[name]
    cm = confusion_matrix(y_test_ox, preds)
    
    sns.heatmap(cm, annot=True, fmt='d', cmap=cm_colormaps_ox[i], ax=axes_ox[i],
                xticklabels=['Sano', 'Parkinson'], yticklabels=['Sano', 'Parkinson'],
                annot_kws={'size': 14})
    axes_ox[i].set_title(f"{name} (CM)", fontsize=14, fontweight='bold')
    axes_ox[i].set_ylabel("Valor Real", fontsize=11)
    axes_ox[i].set_xlabel("Prediccion", fontsize=11)

plt.suptitle("Matrices de Confusion - Deteccion de Parkinson (Oxford)", fontsize=16, fontweight='bold', y=0.98)
plt.tight_layout()
ox_cm_path = os.path.join(DATA_DIR, "comparison_oxford_confusion_matrices.png")
plt.savefig(ox_cm_path, dpi=200)
plt.close()
print("Matrices Oxford guardadas en: outputs/comparison_oxford_confusion_matrices.png")

# --- 5.2 Matriz de Confusion UPDRS (Riesgo Binario) ---
fig_up, axes_up = plt.subplots(2, 2, figsize=(12, 10))
axes_up = axes_up.ravel()
cm_colormaps_up = ['Blues', 'Oranges', 'Greens', 'Purples']
risk_labels = ['Bajo', 'Alto']

for i, (name, model) in enumerate(models_multiclass.items()):
    preds = multiclass_predictions[name]
    cm = confusion_matrix(y_test_up, preds)
    
    sns.heatmap(cm, annot=True, fmt='d', cmap=cm_colormaps_up[i], ax=axes_up[i],
                xticklabels=risk_labels, yticklabels=risk_labels,
                annot_kws={'size': 14})
    axes_up[i].set_title(f"{name} (CM)", fontsize=14, fontweight='bold')
    axes_up[i].set_ylabel("Valor Real", fontsize=11)
    axes_up[i].set_xlabel("Prediccion", fontsize=11)

plt.suptitle("Matrices de Confusion - Nivel de Riesgo (UPDRS)", fontsize=16, fontweight='bold', y=0.98)
plt.tight_layout()
up_cm_path = os.path.join(DATA_DIR, "comparison_updrs_confusion_matrices.png")
plt.savefig(up_cm_path, dpi=200)
plt.close()
print("Matrices UPDRS guardadas en: outputs/comparison_updrs_confusion_matrices.png")

# ==========================================
# 6. CONCLUSION Y RECOMENDACION CLINICA
# ==========================================
print("\n" + "=" * 70)
print("  RECOMENDACIONES CLINICAS Y JUSTIFICACION PARA LA PROFESORA")
print("=" * 70)
print("1. ¿Que algoritmo tiene mejor Sensibilidad (Recall)?")
best_rec_idx = df_binary_metrics[df_binary_metrics['Algoritmo'] != 'Ensemble (Soft Vote)']['Sensibilidad (Recall)'].idxmax()
best_rec_row = df_binary_metrics.loc[best_rec_idx]
print(f"   - Deteccion (Oxford): El modelo con mayor Recall es '{best_rec_row['Algoritmo']}' con {best_rec_row['Sensibilidad (Recall)']:.4%}.")

best_rec_up_idx = df_multiclass_metrics[df_multiclass_metrics['Algoritmo'] != 'Ensemble (Soft Vote)']['Sensibilidad (Recall)'].idxmax()
best_rec_up_row = df_multiclass_metrics.loc[best_rec_up_idx]
print(f"   - Riesgo (UPDRS): El modelo con mayor Recall es '{best_rec_up_row['Algoritmo']}' con {best_rec_up_row['Sensibilidad (Recall)']:.4%}.")

print("\n2. ¿Por que es la metrica de decision?")
print("   - Para deteccion medica de Parkinson (Binario): Se prioriza Recall (Sensibilidad).")
print("     Justificacion: Clasificar a un paciente enfermo como SANO (Falso Negativo) es critico.")
print("   - Para severidad de riesgo (UPDRS Binario): Se prioriza el F1-Score y Recall.")
print("     Justificacion: Identificar adecuadamente los riesgos ALTOS para derivar a consulta.")


print("=" * 70)
print("Proceso de comparacion finalizado con exito!")
