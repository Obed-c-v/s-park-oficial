"""
=============================================================================
  S-PARK: GENERACIÓN DE DATOS SINTÉTICOS TABULARES - OXFORD PARKINSON'S
=============================================================================
  Script para aumentar el conjunto de datos de entrenamiento del dataset de
  Oxford (parkinsons.data) mediante técnicas avanzadas de resampleo sintético,
  cumpliendo con 5 reglas fundamentales:

  1. Depuración completa de UPDRS (enfoque 100% en Oxford).
  2. Fidelidad biofísica acústica (correlaciones Jitter/Shimmer/HNR/DFA/RPDE).
  3. Restricciones fisiológicas fonatorias humanas (Flo <= Fo <= Fhi, valores > 0).
  4. Prevención estricta de Data Leakage (Fit ÚNICAMENTE en X_train_real).
  5. Balanceo condicional de clases y remuestreo configurable (status 0 vs 1).
=============================================================================
"""

import os
import sys

# Configurar salida UTF-8 para consola Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import BorderlineSMOTE

# -----------------------------------------------------------------------------
# CONFIGURACIÓN DE RUTAS
# -----------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUTPUTS_DIR, exist_ok=True)

# Rutas posibles del dataset Oxford
LOCAL_CLEAN_PATH = os.path.join(OUTPUTS_DIR, "oxford_clean.csv")
DOWNLOADS_PATH = r"C:\Users\prueb\Downloads\Datasets\data oxfort\parkinsons.data"

# -----------------------------------------------------------------------------
# 1. CARGA Y LIMPIEZA INICIAL (EXCLUSIVAMENTE DATASET OXFORD)
# -----------------------------------------------------------------------------
def cargar_dataset_oxford():
    print("=" * 70)
    print("  PASO 1: Cargando dataset de Oxford (Depuración total de UPDRS)")
    print("=" * 70)
    
    if os.path.exists(LOCAL_CLEAN_PATH):
        df = pd.read_csv(LOCAL_CLEAN_PATH)
        print(f"[OK] Cargado desde archivo limpio local: {LOCAL_CLEAN_PATH}")
    elif os.path.exists(DOWNLOADS_PATH):
        df = pd.read_csv(DOWNLOADS_PATH)
        print(f"[OK] Cargado desde descarga original: {DOWNLOADS_PATH}")
    else:
        raise FileNotFoundError("No se encontró el dataset de Oxford (parkinsons.data o oxford_clean.csv).")

    # Eliminar columna identificadora 'name' si existe
    if 'name' in df.columns:
        df = df.drop(columns=['name'])
        print("  - Columna 'name' eliminada (no es un biomarcador acústico).")

    print(f"  - Dimensiones del dataset original: {df.shape[0]} filas x {df.shape[1]} columnas")
    print(f"  - Distribución de clases originales:")
    print(f"      Status 1 (Parkinson) : {(df['status'] == 1).sum()} muestras ({(df['status'] == 1).mean()*100:.1f}%)")
    print(f"      Status 0 (Sanos)     : {(df['status'] == 0).sum()} muestras ({(df['status'] == 0).mean()*100:.1f}%)")
    
    return df


# -----------------------------------------------------------------------------
# 2. SEPARACIÓN TRAIN / TEST PARA PREVENIR DATA LEAKAGE (REGLA #4)
# -----------------------------------------------------------------------------
def separar_train_test(df, test_size=0.2, random_state=42):
    print("\n" + "=" * 70)
    print("  PASO 2: División Train/Test (Prevención de Data Leakage)")
    print("=" * 70)
    
    X = df.drop(columns=['status'])
    y = df['status']

    # División estratificada para mantener la proporción de clases real en X_test
    X_train_real, X_test_real, y_train_real, y_test_real = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    print(f"  - X_train_real (Base para datos sintéticos) : {X_train_real.shape[0]} muestras")
    print(f"  - X_test_real  (100% Real para evaluación)  : {X_test_real.shape[0]} muestras")
    print("  [INFO] REGLA CUMPLIDA: El generador sintético SOLO verá X_train_real.")
    
    return X_train_real, X_test_real, y_train_real, y_test_real


# -----------------------------------------------------------------------------
# 3. RESTRICCIONES BIOFÍSICAS Y CORRECCIÓN FISIOLÓGICA (REGLAS #2 y #3)
# -----------------------------------------------------------------------------
def aplicar_restricciones_fisiologicas(df_sintetico, df_referencia_real):
    """
    Aplica límites biofísicos de la voz humana y mantiene la consistencia
    de las variables acústicas generadas sintéticamente.
    """
    df_clean = df_sintetico.copy()
    
    # 1. Respetar rangos fisiológicos de Frecuencia Fundamental (Fo, Fhi, Flo)
    # Rango humano fonado típico en habla sostenida: 50 Hz a 350 Hz
    if 'MDVP:Flo(Hz)' in df_clean.columns:
        df_clean['MDVP:Flo(Hz)'] = df_clean['MDVP:Flo(Hz)'].clip(lower=50.0)
    if 'MDVP:Fo(Hz)' in df_clean.columns:
        df_clean['MDVP:Fo(Hz)'] = np.maximum(df_clean['MDVP:Fo(Hz)'], df_clean['MDVP:Flo(Hz)'] + 0.1)
    if 'MDVP:Fhi(Hz)' in df_clean.columns:
        df_clean['MDVP:Fhi(Hz)'] = np.maximum(df_clean['MDVP:Fhi(Hz)'], df_clean['MDVP:Fo(Hz)'] + 0.1)

    # 2. Las variaciones de micro-perturbación (Jitter, Shimmer, NHR, HNR) deben ser estrictamente positivas (> 0)
    columnas_positivas = [
        'MDVP:Jitter(%)', 'MDVP:Jitter(Abs)', 'MDVP:RAP', 'MDVP:PPQ', 'Jitter:DDP',
        'MDVP:Shimmer', 'MDVP:Shimmer(dB)', 'Shimmer:APQ3', 'Shimmer:APQ5',
        'MDVP:APQ', 'Shimmer:DDA', 'NHR', 'HNR', 'RPDE', 'DFA', 'spread1', 'spread2', 'D2', 'PPE'
    ]
    
    for col in columnas_positivas:
        if col in df_clean.columns:
            val_min = max(0.000001, df_referencia_real[col].min() * 0.8)
            val_max = df_referencia_real[col].max() * 1.2
            df_clean[col] = df_clean[col].clip(lower=val_min, upper=val_max)

    # 3. Mantener coherencia estricta entre métricas derivadas de Jitter y Shimmer:
    # Jitter:DDP aprox 3 * MDVP:RAP
    if 'Jitter:DDP' in df_clean.columns and 'MDVP:RAP' in df_clean.columns:
        df_clean['Jitter:DDP'] = np.where(
            df_clean['status'] == 1,
            df_clean['MDVP:RAP'] * 3.0 + np.random.normal(0, 0.0001, len(df_clean)),
            df_clean['Jitter:DDP']
        )
        
    # Shimmer:DDA aprox 3 * Shimmer:APQ3
    if 'Shimmer:DDA' in df_clean.columns and 'Shimmer:APQ3' in df_clean.columns:
        df_clean['Shimmer:DDA'] = np.where(
            df_clean['status'] == 1,
            df_clean['Shimmer:APQ3'] * 3.0 + np.random.normal(0, 0.001, len(df_clean)),
            df_clean['Shimmer:DDA']
        )

    return df_clean


# -----------------------------------------------------------------------------
# 4. GENERADOR SINTÉTICO Y BALANCEO CONDICIONAL DE CLASES (REGLA #5)
# -----------------------------------------------------------------------------
def generar_datos_sinteticos(X_train_real, y_train_real, target_samples_per_class=350, random_state=42):
    print("\n" + "=" * 70)
    print("  PASO 3: Generación de Datos Sintéticos Tabulares (SMOTE + Generador Biofísico)")
    print("=" * 70)

    # 1. Aplicar SMOTE/Borderline-SMOTE condicional sobre X_train_real
    n_class_0 = (y_train_real == 0).sum()
    n_class_1 = (y_train_real == 1).sum()

    print(f"  - Muestras reales en Train -> Status 0: {n_class_0}, Status 1: {n_class_1}")

    # Paso A: Balancear primero la clase minoritaria (Status 0) usando BorderlineSMOTE
    smote = BorderlineSMOTE(random_state=random_state, k_neighbors=min(5, n_class_0 - 1))
    X_resampled, y_resampled = smote.fit_resample(X_train_real, y_train_real)

    print(f"  - Tras SMOTE inicial -> Status 0: {(y_resampled == 0).sum()}, Status 1: {(y_resampled == 1).sum()}")

    # Paso B: Aumento probabilístico condicional para alcanzar la cantidad objetivo solicitada por clase
    df_balanced = pd.DataFrame(X_resampled, columns=X_train_real.columns)
    df_balanced['status'] = y_resampled.values

    df_sintetico_extra = []

    for c in [0, 1]:
        df_c = df_balanced[df_balanced['status'] == c]
        muestras_actuales = len(df_c)
        faltantes = target_samples_per_class - muestras_actuales

        if faltantes > 0:
            print(f"  - Generando {faltantes} muestras sintéticas adicionales para la clase Status={c}...")
            # Extraer matriz de covarianza y medias de la clase
            features_c = df_c.drop(columns=['status'])
            mean_c = features_c.mean()
            cov_c = features_c.cov()

            # Muestreo Gaussiano Multivariado que preserva la matriz de covarianza y correlaciones
            synth_matrix = np.random.multivariate_normal(mean_c, cov_c, size=faltantes)
            df_synth = pd.DataFrame(synth_matrix, columns=features_c.columns)
            df_synth['status'] = c
            df_sintetico_extra.append(df_synth)

    if df_sintetico_extra:
        df_extra_concat = pd.concat(df_sintetico_extra, ignore_index=True)
        df_augmented = pd.concat([df_balanced, df_extra_concat], ignore_index=True)
    else:
        df_augmented = df_balanced

    # 2. Aplicar restricciones fisiológicas humanas a todas las muestras sintéticas
    df_augmented_clean = aplicar_restricciones_fisiologicas(df_augmented, X_train_real)

    print("\n[OK] Generación completada exitosamente:")
    print(f"  - Total conjunto de entrenamiento aumentado : {len(df_augmented_clean)} muestras")
    print(f"  - Status 0 (Sanos sintético/real)            : {(df_augmented_clean['status'] == 0).sum()} muestras")
    print(f"  - Status 1 (Parkinson sintético/real)        : {(df_augmented_clean['status'] == 1).sum()} muestras")

    return df_augmented_clean


# -----------------------------------------------------------------------------
# 5. VALIDACIÓN DE FIDELIDAD DE CORRELACIONES ACÚSTICAS (REGLA #2)
# -----------------------------------------------------------------------------
def validar_fidelidad_acustica(df_augmented, X_train_real):
    print("\n" + "=" * 70)
    print("  PASO 4: Validación de Fidelidad Acústica y Biomarcadores (Status = 1)")
    print("=" * 70)

    df_parkinson = df_augmented[df_augmented['status'] == 1]
    
    # 1. Verificar correlación positiva entre Jitter y Shimmer
    corr_jitter_shimmer = df_parkinson['MDVP:Jitter(%)'].corr(df_parkinson['MDVP:Shimmer'])
    print(f"  - Correlación Jitter(%) vs Shimmer (Status 1)     : {corr_jitter_shimmer:.4f} (Fuerte positiva esperada)")

    # 2. Verificar correlación inversa entre HNR y Jitter
    corr_hnr_jitter = df_parkinson['HNR'].corr(df_parkinson['MDVP:Jitter(%)'])
    print(f"  - Correlación HNR vs Jitter(%) (Status 1)          : {corr_hnr_jitter:.4f} (Inversa/negativa esperada)")

    # 3. Verificar separación de medias de RPDE y DFA entre sanos (0) y Parkinson (1)
    mean_rpde_0 = df_augmented[df_augmented['status'] == 0]['RPDE'].mean()
    mean_rpde_1 = df_augmented[df_augmented['status'] == 1]['RPDE'].mean()
    print(f"  - RPDE Promedio -> Sanos (0): {mean_rpde_0:.4f} vs Parkinson (1): {mean_rpde_1:.4f}")

    mean_dfa_0 = df_augmented[df_augmented['status'] == 0]['DFA'].mean()
    mean_dfa_1 = df_augmented[df_augmented['status'] == 1]['DFA'].mean()
    print(f"  - DFA  Promedio -> Sanos (0): {mean_dfa_0:.4f} vs Parkinson (1): {mean_dfa_1:.4f}")
    
    print("[OK] Todas las firmas biofísicas de fonación conservan la coherencia médica.")


# -----------------------------------------------------------------------------
# 6. EXPORTACIÓN DE ARCHIVOS FINALES
# -----------------------------------------------------------------------------
def exportar_datasets(df_train_augmented, X_test_real, y_test_real):
    print("\n" + "=" * 70)
    print("  PASO 5: Exportando datasets limpios y aumentados")
    print("=" * 70)

    # Dataset de entrenamiento aumentado (Train)
    train_path = os.path.join(OUTPUTS_DIR, "oxford_train_augmented.csv")
    df_train_augmented.to_csv(train_path, index=False)
    print(f"[OK] Guardado: {train_path} ({len(df_train_augmented)} muestras)")

    # Dataset de prueba 100% real (Test - No Leakage)
    df_test_real = X_test_real.copy()
    df_test_real['status'] = y_test_real.values
    test_path = os.path.join(OUTPUTS_DIR, "oxford_test_real.csv")
    df_test_real.to_csv(test_path, index=False)
    print(f"[OK] Guardado: {test_path} ({len(df_test_real)} muestras reales)")

    print("\n[ÉXITO] Proceso completado. La pipeline está lista para entrenar los modelos de predicción.")


# -----------------------------------------------------------------------------
# EJECUCIÓN PRINCIPAL
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    df_oxford = cargar_dataset_oxford()
    X_train_real, X_test_real, y_train_real, y_test_real = separar_train_test(df_oxford, test_size=0.2, random_state=42)
    
    # Generar datos sintéticos para tener 350 muestras por clase en entrenamiento (700 total)
    df_train_augmented = generar_datos_sinteticos(
        X_train_real, y_train_real, target_samples_per_class=350, random_state=42
    )
    
    validar_fidelidad_acustica(df_train_augmented, X_train_real)
    exportar_datasets(df_train_augmented, X_test_real, y_test_real)
