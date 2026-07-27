import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# Definir directorios
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Cargar datasets
print("Cargando datasets para reentrenamiento de producción...")
df_oxford = pd.read_csv(os.path.join(DATA_DIR, "oxford_clean.csv"))
df_updrs = pd.read_csv(os.path.join(DATA_DIR, "updrs_clean.csv"))

if df_updrs['nivel_riesgo'].dtype == 'object':
    df_updrs['nivel_riesgo'] = df_updrs['nivel_riesgo'].map({'BAJO': 0, 'ALTO': 1})

# ==========================================
# 2. Reentrenar Modelo Oxford (90-10 split)
# ==========================================
print("\nEntrenando modelo de detección (Oxford) bajo split 90-10...")
X_ox = df_oxford.drop(columns=['status'])
y_ox = df_oxford['status']

X_train_ox, _, y_train_ox, _ = train_test_split(
    X_ox, y_ox, test_size=0.10, random_state=42, stratify=y_ox
)

scaler_ox = StandardScaler()
X_train_ox_scaled = scaler_ox.fit_transform(X_train_ox)

rf_ox = RandomForestClassifier(random_state=42, n_estimators=100)
rf_ox.fit(X_train_ox_scaled, y_train_ox)

# Guardar
joblib.dump(scaler_ox, os.path.join(MODELS_DIR, "scaler_oxford.joblib"))
joblib.dump(rf_ox, os.path.join(MODELS_DIR, "rf_probability.joblib"))
print("[OK] Escalador y modelo Oxford guardados en ml/models/")

# ==========================================
# 3. Reentrenar Modelo UPDRS (90-10 split)
# ==========================================
print("\nEntrenando modelo de severidad (UPDRS) bajo split 90-10...")
X_up = df_updrs.drop(columns=['nivel_riesgo'])
y_up = df_updrs['nivel_riesgo']

X_train_up, _, y_train_up, _ = train_test_split(
    X_up, y_up, test_size=0.10, random_state=42, stratify=y_up
)

scaler_up = StandardScaler()
X_train_up_scaled = scaler_up.fit_transform(X_train_up)

rf_up = RandomForestClassifier(random_state=42, n_estimators=100)
rf_up.fit(X_train_up_scaled, y_train_up)

# Guardar
joblib.dump(scaler_up, os.path.join(MODELS_DIR, "scaler_updrs.joblib"))
joblib.dump(rf_up, os.path.join(MODELS_DIR, "rf_risk.joblib"))
print("[OK] Escalador y modelo UPDRS guardados en ml/models/")

print("\n[SUCCESS] Todos los modelos de producción han sido actualizados con éxito.")
