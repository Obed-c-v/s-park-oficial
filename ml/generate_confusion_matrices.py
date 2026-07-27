import pandas as pd
import numpy as np
import os
import glob
import matplotlib
matplotlib.use('Agg')  # Evitar ventanas emergentes de GUI
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import confusion_matrix

# Definir directorios
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(DATA_DIR, exist_ok=True)

# 1. Eliminar imágenes antiguas de matriz de confusión
print("Limpiando archivos de imagen antiguos...")
antiguos = glob.glob(os.path.join(DATA_DIR, "*confusion*.png"))
for archivo in antiguos:
    try:
        os.remove(archivo)
        print(f"Eliminado: {os.path.basename(archivo)}")
    except Exception as e:
        print(f"No se pudo eliminar {os.path.basename(archivo)}: {e}")

# 2. Cargar datasets
print("\nCargando datasets...")
df_oxford = pd.read_csv(os.path.join(DATA_DIR, "oxford_clean.csv"))
df_updrs = pd.read_csv(os.path.join(DATA_DIR, "updrs_clean.csv"))

df_updrs['nivel_riesgo'] = df_updrs['nivel_riesgo'].astype(str).map({'BAJO': 0, 'ALTO': 1})

datasets = {
    "oxford": {
        "df": df_oxford,
        "target": "status",
        "labels": ["Sano", "Parkinson"],
        "title": "Detección de Parkinson (Oxford)"
    },
    "updrs": {
        "df": df_updrs,
        "target": "nivel_riesgo",
        "labels": ["Bajo Riesgo", "Alto Riesgo"],
        "title": "Severidad de Síntomas (UPDRS)"
    }
}

splits = {
    "90-10": 0.10,
    "80-20": 0.20,
    "70-30": 0.30
}

def get_models():
    return {
        "rf": (RandomForestClassifier(random_state=42, n_estimators=100), "Random Forest"),
        "svm": (SVC(random_state=42, probability=True, kernel='rbf'), "SVM (RBF Kernel)"),
        "gb": (GradientBoostingClassifier(random_state=42), "Gradient Boosting"),
        "xgb": (XGBClassifier(random_state=42, eval_metric='logloss'), "XGBoost")
    }

# 3. Generar matrices de confusión
for ds_key, ds_info in datasets.items():
    df = ds_info["df"]
    target_col = ds_info["target"]
    class_labels = ds_info["labels"]
    ds_title = ds_info["title"]
    
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    models_dict = get_models()
    
    for model_key, (clf, model_fullname) in models_dict.items():
        print(f"Generando plots de confusión para {ds_title} usando {model_fullname}...")
        
        # Configurar el gráfico con 1 fila y 3 columnas (una para cada split)
        fig, axes = plt.subplots(1, 3, figsize=(18, 5.5))
        fig.suptitle(f"Matrices de Confusión - {ds_title}\nAlgoritmo: {model_fullname}", fontsize=16, fontweight='bold')
        
        for idx, (split_name, test_size) in enumerate(splits.items()):
            # Dividir datos
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42, stratify=y
            )
            
            # Escalar
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Entrenar
            clf.fit(X_train_scaled, y_train)
            
            # Predecir
            y_pred = clf.predict(X_test_scaled)
            
            # Calcular matriz
            cm = confusion_matrix(y_test, y_pred)
            
            # Graficar Heatmap en la columna correspondiente
            ax = axes[idx]
            sns.heatmap(
                cm, annot=True, fmt="d", cmap="Blues", cbar=False,
                xticklabels=class_labels, yticklabels=class_labels,
                annot_kws={"size": 14, "weight": "bold"}, ax=ax
            )
            
            ax.set_title(f"Split {split_name}\n(Test Size: {len(X_test)})", fontsize=12, fontweight='bold')
            ax.set_xlabel("Predicción del Modelo", fontsize=11)
            ax.set_ylabel("Valor Real Clínico", fontsize=11)
            
        plt.tight_layout()
        
        # Guardar gráfico
        output_filename = f"{ds_key}_confusion_{model_key}.png"
        output_path = os.path.join(DATA_DIR, output_filename)
        plt.savefig(output_path, dpi=120)
        plt.close()
        print(f"--> Guardado: {output_filename}")

print("\n[SUCCESS] Proceso de graficación de matrices de confusión finalizado.")
