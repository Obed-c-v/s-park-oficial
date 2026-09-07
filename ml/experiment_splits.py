"""
=============================================================================
  S-PARK: EXPERIMENTACIÓN INTEGRAL DE ML (80-20, 70-30, 5-FOLD CV, REDUCCIÓN)
=============================================================================
  Script de experimentación paso a paso para la defensa académica:
  1. Comparativa de Particiones: 80-20 vs 70-30 (100% Test Real, 0% Leakage).
  2. Validación Cruzada (Stratified 5-Fold Cross-Validation).
  3. Reducción de Variables: 22 (Completo) vs 11 (50%) vs 6 (Esenciales).
  4. Generación de imágenes PNG de Matrices de Confusión y Curvas ROC.
  5. Exportación a Excel de 5 pestañas profesionales.
=============================================================================
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, log_loss, roc_curve
)

import generate_synthetic_oxford

# -----------------------------------------------------------------------------
# RUTAS DE SALIDA
# -----------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

REPORT_EXCEL_PATH = os.path.join(OUTPUTS_DIR, "evaluacion_modelos_reporte.xlsx")

# -----------------------------------------------------------------------------
# CONFIGURACIÓN DE MODELOS
# -----------------------------------------------------------------------------
def get_models():
    return {
        "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=10, class_weight='balanced', random_state=42),
        "SVM (RBF)": SVC(kernel='rbf', C=1.5, probability=True, class_weight='balanced', random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42),
        "XGBoost": XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, eval_metric='logloss', random_state=42)
    }

# -----------------------------------------------------------------------------
# PASO 1: EVALUAR PARTICIONES DE SPLIT (80-20 vs 70-30)
# -----------------------------------------------------------------------------
def evaluar_split(test_ratio=0.2, split_label="80-20"):
    print("\n" + "=" * 70)
    print(f"  EVALUANDO PARTICIÓN: {split_label} ({int((1-test_ratio)*100)}% Train / {int(test_ratio*100)}% Test)")
    print("=" * 70)
    
    df_ox = generate_synthetic_oxford.cargar_dataset_oxford()
    X_train_real, X_test_real, y_train_real, y_test_real = generate_synthetic_oxford.separar_train_test(
        df_ox, test_size=test_ratio, random_state=42
    )

    # Generar datos sintéticos solo en X_train_real
    df_train_aug = generate_synthetic_oxford.generar_datos_sinteticos(
        X_train_real, y_train_real, target_samples_per_class=350, random_state=42
    )

    X_train = df_train_aug.drop(columns=['status'])
    y_train = df_train_aug['status']
    
    X_test = X_test_real.copy()
    y_test = y_test_real.copy()

    # Escalamiento
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Guardar escalador si es 80-20 (estándar)
    if split_label == "80-20":
        joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler_oxford.joblib"))

    models = get_models()
    split_results = []
    confusion_dict = {}

    fig, axes = plt.subplots(2, 2, figsize=(10, 8))
    axes = axes.flatten()

    for idx, (name, model) in enumerate(models.items()):
        model.fit(X_train_scaled, y_train)
        
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        loss = log_loss(y_test, y_prob)
        auc = roc_auc_score(y_test, y_prob)

        train_acc = accuracy_score(y_train, model.predict(X_train_scaled))
        gap = train_acc - acc

        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (0, 0, 0, 0)
        confusion_dict[name] = cm

        split_results.append({
            "Partición": split_label,
            "Modelo": name,
            "Accuracy (Prueba)": round(acc, 4),
            "Accuracy (Train)": round(train_acc, 4),
            "Gap (Sobreajuste)": round(gap, 4),
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

        # Plot Matriz de confusión individual
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[idx],
                    xticklabels=['Sano', 'Parkinson'], yticklabels=['Sano', 'Parkinson'])
        axes[idx].set_title(f"{name} ({split_label})")
        axes[idx].set_ylabel("Valor Real")
        axes[idx].set_xlabel("Predicción")

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUTS_DIR, f"confusion_matrices_{split_label.replace('-', '_')}.png"), dpi=150)
    plt.close()

    print(f"✅ Matriz de confusión guardada en 'outputs/confusion_matrices_{split_label.replace('-', '_')}.png'")
    return pd.DataFrame(split_results), X_train, y_train, X_test, y_test


# -----------------------------------------------------------------------------
# PASO 2: VALIDACIÓN CRUZADA (STRATIFIED 5-FOLD CV)
# -----------------------------------------------------------------------------
def evaluar_cross_validation(X_train, y_train):
    print("\n" + "=" * 70)
    print("  EVALUANDO VALIDACIÓN CRUZADA (STRATIFIED 5-FOLD CV)...")
    print("=" * 70)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    models = get_models()
    cv_results = []

    scoring = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']

    for name, model in models.items():
        scores = cross_validate(model, X_scaled, y_train, cv=cv, scoring=scoring)
        
        cv_results.append({
            "Modelo": name,
            "Accuracy Media": round(scores['test_accuracy'].mean(), 4),
            "Accuracy Std": round(scores['test_accuracy'].std(), 4),
            "Recall Medio": round(scores['test_recall'].mean(), 4),
            "Recall Std": round(scores['test_recall'].std(), 4),
            "Precision Media": round(scores['test_precision'].mean(), 4),
            "F1-Score Medio": round(scores['test_f1'].mean(), 4),
            "ROC-AUC Medio": round(scores['test_roc_auc'].mean(), 4)
        })

        print(f"  - {name:20s} | CV Acc: {scores['test_accuracy'].mean():.4f} (±{scores['test_accuracy'].std():.4f}) | CV Recall: {scores['test_recall'].mean():.4f}")

    return pd.DataFrame(cv_results)


# -----------------------------------------------------------------------------
# PASO 3: REDUCCIÓN DE VARIABLES (22 vs 11 vs 6 CARACTERÍSTICAS)
# -----------------------------------------------------------------------------
def evaluar_reduccion_variables(X_train_80, y_train_80, X_test_80, y_test_80):
    print("\n" + "=" * 70)
    print("  EVALUANDO REDUCCIÓN DE VARIABLES (22 vs 11 vs 6 Característica)")
    print("=" * 70)

    # 1. Obtener orden de importancia con Random Forest
    rf_selector = RandomForestClassifier(n_estimators=150, random_state=42)
    rf_selector.fit(X_train_80, y_train_80)
    
    importances = rf_selector.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    all_features = X_train_80.columns.values
    
    top_22 = list(all_features)
    top_11 = list(all_features[sorted_idx[:11]])
    top_6  = list(all_features[sorted_idx[:6]])

    feature_sets = {
        "22 Variables (Completo)": top_22,
        "11 Variables (50% Reducción)": top_11,
        "6 Variables (Set Mínimo)": top_6
    }

    reduction_results = []

    for set_name, feature_list in feature_sets.items():
        X_tr_sub = X_train_80[feature_list]
        X_te_sub = X_test_80[feature_list]

        scaler = StandardScaler()
        X_tr_sc = scaler.fit_transform(X_tr_sub)
        X_te_sc = scaler.transform(X_te_sub)

        models = get_models()
        for m_name, model in models.items():
            model.fit(X_tr_sc, y_train_80)
            y_pred = model.predict(X_te_sc)
            y_prob = model.predict_proba(X_te_sc)[:, 1]

            acc = accuracy_score(y_test_80, y_pred)
            rec = recall_score(y_test_80, y_pred)
            f1 = f1_score(y_test_80, y_pred)
            auc = roc_auc_score(y_test_80, y_prob)

            reduction_results.append({
                "Set de Caracteres": set_name,
                "Número de Variables": len(feature_list),
                "Modelo": m_name,
                "Accuracy": round(acc, 4),
                "Recall (Sensibilidad)": round(rec, 4),
                "F1-Score": round(f1, 4),
                "ROC-AUC": round(auc, 4),
                "Variables Incluidas": ", ".join(feature_list[:4]) + ("..." if len(feature_list) > 4 else "")
            })

            print(f"  - [{set_name[:12]}] {m_name:18s} | Acc: {acc:.4f} | Recall: {rec:.4f} | F1: {f1:.4f}")

    return pd.DataFrame(reduction_results)


# -----------------------------------------------------------------------------
# PASO 4: GENERACIÓN DEL INFORME CONSOLIDADO EXCEL (5 PESTAÑAS)
# -----------------------------------------------------------------------------
def exportar_reporte_excel(df_80_20, df_70_30, df_cv, df_reduction):
    print("\n" + "=" * 70)
    print("  GENERANDO INFORME CONSOLIDADO EN EXCEL (5 PESTAÑAS)...")
    print("=" * 70)

    # Pestaña Resumen Comparativo de Gaps
    df_gaps = pd.concat([
        df_80_20[['Partición', 'Modelo', 'Accuracy (Train)', 'Accuracy (Prueba)', 'Gap (Sobreajuste)', 'ROC-AUC']],
        df_70_30[['Partición', 'Modelo', 'Accuracy (Train)', 'Accuracy (Prueba)', 'Gap (Sobreajuste)', 'ROC-AUC']]
    ], ignore_index=True)

    with pd.ExcelWriter(REPORT_EXCEL_PATH, engine='openpyxl') as writer:
        df_80_20.to_excel(writer, sheet_name="Particion 80-20", index=False)
        df_70_30.to_excel(writer, sheet_name="Particion 70-30", index=False)
        df_cv.to_excel(writer, sheet_name="Validacion Cruzada (5-Fold)", index=False)
        df_reduction.to_excel(writer, sheet_name="Reduccion de Variables", index=False)
        df_gaps.to_excel(writer, sheet_name="Analisis de Sobreajuste", index=False)

    print(f"✅ Reporte Excel de 5 pestañas guardado en '{REPORT_EXCEL_PATH}'")


# -----------------------------------------------------------------------------
# EJECUCIÓN PRINCIPAL
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    df_80_20, X_tr_80, y_tr_80, X_te_80, y_te_80 = evaluar_split(0.2, "80-20")
    df_70_30, X_tr_70, y_tr_70, X_te_70, y_te_70 = evaluar_split(0.3, "70-30")
    
    df_cv = evaluar_cross_validation(X_tr_80, y_tr_80)
    df_reduction = evaluar_reduccion_variables(X_tr_80, y_tr_80, X_te_80, y_te_80)
    
    exportar_reporte_excel(df_80_20, df_70_30, df_cv, df_reduction)
    print("\n🎉 ¡EXPERIMENTACIÓN PASO A PASO COMPLETADA CON ÉXITO! 🎉")
