import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split, cross_validate, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
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

# Definir directorios
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(DATA_DIR, exist_ok=True)

# Algoritmos a evaluar
def get_models():
    return {
        "Random Forest": RandomForestClassifier(random_state=42, n_estimators=100),
        "SVM": SVC(random_state=42, probability=True, kernel='rbf'),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
        "XGBoost": XGBClassifier(random_state=42, eval_metric='logloss')
    }

def main():
    # 1. Carga de los Datasets
    print("Cargando datasets...")
    df_oxford = pd.read_csv(os.path.join(DATA_DIR, "oxford_clean.csv"))
    df_updrs = pd.read_csv(os.path.join(DATA_DIR, "updrs_clean.csv"))

    # Mapear nivel_riesgo a binario
    df_updrs['nivel_riesgo'] = df_updrs['nivel_riesgo'].astype(str).map({'BAJO': 0, 'ALTO': 1})

    # Lista de Datasets a evaluar
    datasets = {
        "Oxford (Detección de Parkinson)": {
            "df": df_oxford,
            "target": "status"
        },
        "UPDRS (Severidad de Síntomas)": {
            "df": df_updrs,
            "target": "nivel_riesgo"
        }
    }

    # Splits a evaluar
    splits = {
        "90-10": 0.10,
        "80-20": 0.20,
        "70-30": 0.30
    }

    # Almacenes de resultados
    resumen_records = []
    oxford_variables_records = []
    updrs_variables_records = []
    confusion_records = []
    feature_importance_records = []

    # Bucle principal de evaluación
    for ds_name, ds_info in datasets.items():
        df = ds_info["df"]
        target_col = ds_info["target"]
        
        X_full = df.drop(columns=[target_col])
        y = df[target_col]
        
        # --- Determinar importancia de variables global con Random Forest para la selección ---
        print(f"Calculando ranking de variables para {ds_name}...")
        scaler_temp = StandardScaler()
        X_scaled_temp = scaler_temp.fit_transform(X_full)
        rf_temp = RandomForestClassifier(random_state=42, n_estimators=100, n_jobs=-1)
        rf_temp.fit(X_scaled_temp, y)
        
        importances = rf_temp.feature_importances_
        feat_imp = pd.Series(importances, index=X_full.columns).sort_values(ascending=False)
        
        # Definir subconjuntos de variables
        num_features = len(X_full.columns)
        half_num = num_features // 2
        top_5_num = 5 if num_features >= 10 else 4
        
        subsets = {
            "Todas las variables": list(X_full.columns),
            f"Mitad más importantes ({half_num} var)": list(feat_imp.index[:half_num]),
            f"Top 5 más importantes ({top_5_num} var)": list(feat_imp.index[:top_5_num])
        }
        
        # Registrar la importancia de las variables para el reporte Excel
        for feat, imp in feat_imp.items():
            feature_importance_records.append({
                "Dataset": ds_name,
                "Variable (Biomarcador)": feat,
                "Importancia (Random Forest)": imp
            })
        
        for var_subset_name, var_list in subsets.items():
            X_sub = X_full[var_list]
            
            for split_name, test_size in splits.items():
                print(f"Evaluando {ds_name} - {var_subset_name} - Split {split_name}...")
                
                # Split train/test
                X_train, X_test, y_train, y_test = train_test_split(
                    X_sub, y, test_size=test_size, random_state=42, stratify=y
                )
                
                # Escalar variables
                scaler = StandardScaler()
                X_train_scaled = scaler.fit_transform(X_train)
                X_test_scaled = scaler.transform(X_test)
                
                models = get_models()
                
                for model_name, clf in models.items():
                    # 1. Validación Cruzada (5-fold) sobre train
                    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
                    cv_results = cross_validate(
                        clf, X_train_scaled, y_train, cv=cv, 
                        scoring=['accuracy', 'f1'], n_jobs=-1
                    )
                    cv_acc_mean = cv_results['test_accuracy'].mean()
                    cv_acc_std = cv_results['test_accuracy'].std()
                    cv_f1_mean = cv_results['test_f1'].mean()
                    cv_f1_std = cv_results['test_f1'].std()
                    
                    # 2. Entrenar modelo
                    clf.fit(X_train_scaled, y_train)
                    
                    # 3. Predicciones
                    y_pred = clf.predict(X_test_scaled)
                    y_prob = clf.predict_proba(X_test_scaled)[:, 1]
                    
                    # 4. Calcular métricas
                    acc = accuracy_score(y_test, y_pred)
                    prec = precision_score(y_test, y_pred, zero_division=0)
                    rec = recall_score(y_test, y_pred, zero_division=0)
                    f1 = f1_score(y_test, y_pred, zero_division=0)
                    
                    try:
                        auc = roc_auc_score(y_test, y_prob)
                    except:
                        auc = np.nan
                        
                    try:
                        loss = log_loss(y_test, y_prob)
                    except:
                        loss = np.nan
                        
                    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
                    
                    record = {
                        "Algoritmo": model_name,
                        "Variables": var_subset_name,
                        "Split": split_name,
                        "Cant Variables": len(var_list),
                        "Test Accuracy": acc,
                        "Test Precision": prec,
                        "Test Recall": rec,
                        "Test F1-Score": f1,
                        "Test ROC-AUC": auc,
                        "Test Log Loss": loss,
                        "CV Accuracy Mean": cv_acc_mean,
                        "CV Accuracy Std": cv_acc_std,
                        "CV F1 Mean": cv_f1_mean,
                        "CV F1 Std": cv_f1_std
                    }
                    
                    # Almacenar en listas específicas
                    if "Oxford" in ds_name:
                        oxford_variables_records.append(record)
                    else:
                        updrs_variables_records.append(record)
                        
                    # Registrar en resumen general (solo para "Todas las variables" para comparación limpia de modelos)
                    if var_subset_name == "Todas las variables":
                        resumen_records.append({
                            "Dataset": ds_name,
                            **record
                        })
                        
                        # Registrar confusión solo para el baseline completo
                        confusion_records.append({
                            "Dataset": ds_name,
                            "Algoritmo": model_name,
                            "Split": split_name,
                            "Verdaderos Negativos (TN)": tn,
                            "Falsos Positivos (FP)": fp,
                            "Falsos Negativos (FN)": fn,
                            "Verdaderos Positivos (TP)": tp
                        })

    # DataFrames finales
    df_resumen = pd.DataFrame(resumen_records)
    df_oxford_vars = pd.DataFrame(oxford_variables_records)
    df_updrs_vars = pd.DataFrame(updrs_variables_records)
    df_confusion = pd.DataFrame(confusion_records)
    df_importance = pd.DataFrame(feature_importance_records)

    # Guardar a Excel con formato estructurado
    excel_path = os.path.join(DATA_DIR, "evaluacion_modelos_reporte.xlsx")
    print(f"\nEscribiendo archivo Excel en: {excel_path}...")

    try:
        writer = pd.ExcelWriter(excel_path, engine='openpyxl')
    except PermissionError:
        import time
        timestamp = int(time.time())
        excel_path = os.path.join(DATA_DIR, f"evaluacion_modelos_reporte_{timestamp}.xlsx")
        print(f"[WARNING] El archivo original estaba bloqueado (abierto en Excel). Guardando en: {excel_path}...")
        writer = pd.ExcelWriter(excel_path, engine='openpyxl')

    with writer:
        # 1. Resumen General Comparativo
        df_resumen.to_excel(writer, sheet_name="Resumen_Comparativo", index=False)
        
        # 2. Hoja Oxford: Tablas separadas por algoritmo
        workbook = writer.book
        ws_ox = workbook.create_sheet(title="Oxford_Por_Variables")
        writer.sheets["Oxford_Por_Variables"] = ws_ox
        
        row_idx = 0
        for algo_name in ["Random Forest", "SVM", "Gradient Boosting", "XGBoost"]:
            # Escribir título del algoritmo
            ws_ox.cell(row=row_idx+1, column=1, value=f"TABLA DE EVALUACIÓN - ALGORITMO: {algo_name.upper()}")
            ws_ox.cell(row=row_idx+1, column=1).font = ws_ox.cell(row=row_idx+1, column=1).font.copy(bold=True, size=12)
            row_idx += 1
            
            # Filtrar datos de ese algoritmo
            df_algo = df_oxford_vars[df_oxford_vars["Algoritmo"] == algo_name].drop(columns=["Algoritmo"])
            df_algo.to_excel(writer, sheet_name="Oxford_Por_Variables", startrow=row_idx, index=False)
            
            row_idx += len(df_algo) + 4  # Dejar filas vacías
            
        # 3. Hoja UPDRS: Tablas separadas por algoritmo
        ws_up = workbook.create_sheet(title="UPDRS_Por_Variables")
        writer.sheets["UPDRS_Por_Variables"] = ws_up
        
        row_idx = 0
        for algo_name in ["Random Forest", "SVM", "Gradient Boosting", "XGBoost"]:
            # Escribir título del algoritmo
            ws_up.cell(row=row_idx+1, column=1, value=f"TABLA DE EVALUACIÓN - ALGORITMO: {algo_name.upper()}")
            ws_up.cell(row=row_idx+1, column=1).font = ws_up.cell(row=row_idx+1, column=1).font.copy(bold=True, size=12)
            row_idx += 1
            
            # Filtrar datos de ese algoritmo
            df_algo = df_updrs_vars[df_updrs_vars["Algoritmo"] == algo_name].drop(columns=["Algoritmo"])
            df_algo.to_excel(writer, sheet_name="UPDRS_Por_Variables", startrow=row_idx, index=False)
            
            row_idx += len(df_algo) + 4  # Dejar filas vacías
            
        # 4. Matrices de Confusión
        df_confusion.to_excel(writer, sheet_name="Matrices_Confusion", index=False)
        
        # 5. Importancia de Variables
        df_importance.to_excel(writer, sheet_name="Importancia_Variables", index=False)

    print("[SUCCESS] Reporte de Excel estructurado y re-generado con éxito.")

if __name__ == '__main__':
    main()
