import os
import pickle
import requests
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error, r2_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBRegressor, XGBClassifier

# Create directories
os.makedirs("datasets", exist_ok=True)
os.makedirs("models", exist_ok=True)
os.makedirs("docs/metrics", exist_ok=True)

# Set random seed for reproducibility
np.random.seed(42)

# ==========================================
# 1. YIELD PREDICTION DATASET & MODEL (XGBoost)
# ==========================================
print("Generating Yield Prediction dataset...")
n_samples = 1500
crops = ['Rice', 'Wheat', 'Corn', 'Cotton', 'Potato']
states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka']
soils = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy']
seasons = ['Kharif', 'Rabi', 'Summer']

data_yield = {
    'Crop': np.random.choice(crops, n_samples),
    'State': np.random.choice(states, n_samples),
    'Area': np.random.uniform(5, 500, n_samples), # in hectares
    'Rainfall': np.random.uniform(300, 2000, n_samples), # in mm
    'Temperature': np.random.uniform(15, 38, n_samples), # in C
    'Humidity': np.random.uniform(40, 90, n_samples), # in %
    'Soil_Type': np.random.choice(soils, n_samples),
    'Season': np.random.choice(seasons, n_samples)
}

df_yield = pd.DataFrame(data_yield)

# Define simple rules for Yield to make it predictable
def calculate_yield(row):
    base_yield = 2.5
    crop_multipliers = {'Rice': 1.5, 'Wheat': 1.3, 'Corn': 1.8, 'Cotton': 0.8, 'Potato': 4.5}
    soil_multipliers = {'Alluvial': 1.2, 'Black': 1.1, 'Red': 0.9, 'Laterite': 0.8, 'Sandy': 0.6}
    temp_factor = 1.0 - abs(row['Temperature'] - 27) / 40.0
    rain_factor = 1.0 - abs(row['Rainfall'] - 1000) / 2000.0
    
    y = base_yield * crop_multipliers[row['Crop']] * soil_multipliers[row['Soil_Type']] * temp_factor * rain_factor
    y += np.random.normal(0, 0.1 * y)
    return max(0.5, y)

df_yield['Yield'] = df_yield.apply(calculate_yield, axis=1)
df_yield.to_csv("datasets/yield_data.csv", index=False)

# Preprocessing & Model Training (XGBoost)
print("Training Yield Prediction model...")
df_yield_encoded = pd.get_dummies(df_yield, columns=['Crop', 'State', 'Soil_Type', 'Season'])
X_y = df_yield_encoded.drop('Yield', axis=1)
y_y = df_yield_encoded['Yield']

X_train_y, X_test_y, y_train_y, y_test_y = train_test_split(X_y, y_y, test_size=0.2, random_state=42)
model_yield = XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, n_jobs=-1)
model_yield.fit(X_train_y, y_train_y)

y_pred_y = model_yield.predict(X_test_y)
rmse = np.sqrt(mean_squared_error(y_test_y, y_pred_y))
r2 = r2_score(y_test_y, y_pred_y)
print(f"Yield Prediction Model (XGBoost) -> RMSE: {rmse:.4f}, R2: {r2:.4f}")

# Plot Regression Results
plt.figure(figsize=(8, 6))
plt.scatter(y_test_y, y_pred_y, alpha=0.5, color='forestgreen')
plt.plot([y_test_y.min(), y_test_y.max()], [y_test_y.min(), y_test_y.max()], 'r--', lw=2)
plt.xlabel('Actual Yield (t/ha)')
plt.ylabel('Predicted Yield (t/ha)')
plt.title('Yield Prediction - Actual vs Predicted')
plt.tight_layout()
plt.savefig("docs/metrics/yield_regression_plot.png")
plt.close()

# Plot Feature Importance
importances_y = model_yield.feature_importances_
indices_y = np.argsort(importances_y)[::-1][:10]
plt.figure(figsize=(10, 6))
sns.barplot(x=importances_y[indices_y], y=np.array(X_y.columns)[indices_y], palette="viridis")
plt.title('Yield Model - Top 10 Feature Importances')
plt.xlabel('Relative Importance')
plt.tight_layout()
plt.savefig("docs/metrics/yield_feature_importance.png")
plt.close()

# Save Yield model and features list
yield_payload = {
    'model': model_yield,
    'features': list(X_y.columns)
}
with open("models/yield_model.pkl", "wb") as f:
    pickle.dump(yield_payload, f)


# ==========================================
# 2. CROP RECOMMENDATION MODEL (XGBoost)
# ==========================================
print("Resolving Crop Recommendation dataset...")
# Load local cached dataset if exists, else fallback to sim
downloaded_success = False
try:
    df_rec = pd.read_csv("datasets/crop_recommendation_data.csv")
    df_rec.rename(columns={
        'N': 'N', 'P': 'P', 'K': 'K',
        'temperature': 'Temperature',
        'humidity': 'Humidity',
        'ph': 'pH',
        'rainfall': 'Rainfall',
        'label': 'Label'
    }, inplace=True)
    df_rec['Label'] = df_rec['Label'].str.capitalize()
    downloaded_success = True
    print(f"Loaded existing Crop Recommendation dataset with {df_rec.shape[0]} rows.")
except Exception:
    pass

if not downloaded_success:
    print("Generating Crop Recommendation fallback dataset...")
    # Generate simulated NPK values
    data_rec = []
    crop_targets = ['Rice', 'Wheat', 'Corn', 'Cotton', 'Potato']
    for _ in range(1500):
        c = np.random.choice(crop_targets)
        if c == 'Rice':
            n, p, k = np.random.uniform(70, 95), np.random.uniform(35, 55), np.random.uniform(35, 45)
            t, h, r, ph = np.random.uniform(22, 32), np.random.uniform(80, 92), np.random.uniform(1400, 2400), np.random.uniform(5.5, 6.5)
        elif c == 'Wheat':
            n, p, k = np.random.uniform(60, 85), np.random.uniform(35, 48), np.random.uniform(30, 42)
            t, h, r, ph = np.random.uniform(15, 24), np.random.uniform(52, 68), np.random.uniform(600, 950), np.random.uniform(6.0, 7.2)
        elif c == 'Corn':
            n, p, k = np.random.uniform(80, 115), np.random.uniform(40, 65), np.random.uniform(35, 55)
            t, h, r, ph = np.random.uniform(20, 30), np.random.uniform(62, 82), np.random.uniform(800, 1300), np.random.uniform(5.8, 7.0)
        elif c == 'Cotton':
            n, p, k = np.random.uniform(55, 78), np.random.uniform(32, 48), np.random.uniform(32, 48)
            t, h, r, ph = np.random.uniform(24, 34), np.random.uniform(50, 78), np.random.uniform(500, 850), np.random.uniform(6.0, 7.8)
        else:
            n, p, k = np.random.uniform(85, 120), np.random.uniform(55, 85), np.random.uniform(95, 140)
            t, h, r, ph = np.random.uniform(15, 22), np.random.uniform(70, 88), np.random.uniform(500, 780), np.random.uniform(5.2, 5.8)
        data_rec.append([n, p, k, t, h, r, ph, c])
        
    df_rec = pd.DataFrame(data_rec, columns=['N', 'P', 'K', 'Temperature', 'Humidity', 'Rainfall', 'pH', 'Label'])
    df_rec.to_csv("datasets/crop_recommendation_data.csv", index=False)

# Train Model (XGBoost Classifier)
print("Training Crop Recommendation model...")
X_c = df_rec[['N', 'P', 'K', 'Temperature', 'Humidity', 'Rainfall', 'pH']]
y_c = df_rec['Label']

le = LabelEncoder()
y_encoded = le.fit_transform(y_c)

X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_c, y_encoded, test_size=0.2, random_state=42)
model_rec = XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, eval_metric='mlogloss')
model_rec.fit(X_train_c, y_train_c)

# Evaluation
y_pred_c = model_rec.predict(X_test_c)
print(classification_report(y_test_c, y_pred_c, target_names=le.classes_))

# Save Confusion Matrix
cm = confusion_matrix(y_test_c, y_pred_c)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', xticklabels=le.classes_, yticklabels=le.classes_, cmap='YlGnBu')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Crop Recommendation Confusion Matrix')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig("docs/metrics/crop_recommendation_cm.png")
plt.close()

# Plot Feature Importance
importances_c = model_rec.feature_importances_
plt.figure(figsize=(8, 6))
sns.barplot(x=importances_c, y=X_c.columns, palette="mako")
plt.title('Crop Recommender - Feature Importances')
plt.xlabel('Relative Importance')
plt.tight_layout()
plt.savefig("docs/metrics/crop_recommendation_feature_importance.png")
plt.close()

# Save Model with payload
payload_rec = {
    'model': model_rec,
    'classes': list(le.classes_)
}
with open("models/crop_recommendation_model.pkl", "wb") as f:
    pickle.dump(payload_rec, f)


# ==========================================
# 3. FERTILIZER RECOMMENDATION MODEL
# ==========================================
print("Generating Fertilizer Recommendation dataset...")
fertilizers = ['Urea', 'DAP', 'MOP', 'NPK 19-19-19', 'SSP', 'Organic Compost']
data_fert = []
for _ in range(1200):
    soil = np.random.choice(soils)
    crop = np.random.choice(crops)
    n = np.random.uniform(10, 150)
    p = np.random.uniform(10, 100)
    k = np.random.uniform(10, 150)
    
    if n < 40 and p > 50:
        label = 'DAP'
    elif n < 50 and k < 40:
        label = 'NPK 19-19-19'
    elif n > 100 and p < 40 and k < 40:
        label = 'Urea'
    elif k > 100 and n < 50:
        label = 'MOP'
    elif p < 30 and n < 30:
        label = 'SSP'
    else:
        label = 'Organic Compost'
        
    data_fert.append({
        'Soil_Type': soil,
        'Crop': crop,
        'N': n,
        'P': p,
        'K': k,
        'Fertilizer': label
    })

df_fert = pd.DataFrame(data_fert)
df_fert.to_csv("datasets/fertilizer_data.csv", index=False)

# Train Model
print("Training Fertilizer Recommendation model...")
df_fert_encoded = pd.get_dummies(df_fert, columns=['Soil_Type', 'Crop'])
X_f = df_fert_encoded.drop('Fertilizer', axis=1)
y_f = df_fert_encoded['Fertilizer']

le_f = LabelEncoder()
y_encoded_f = le_f.fit_transform(y_f)

X_train_f, X_test_f, y_train_f, y_test_f = train_test_split(X_f, y_encoded_f, test_size=0.2, random_state=42)
model_fert = XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42, eval_metric='mlogloss')
model_fert.fit(X_train_f, y_train_f)

fert_payload = {
    'model': model_fert,
    'classes': list(le_f.classes_),
    'features': list(X_f.columns)
}
with open("models/fertilizer_model.pkl", "wb") as f:
    pickle.dump(fert_payload, f)


# ==========================================
# 4. SMART IRRIGATION MODEL
# ==========================================
print("Generating Smart Irrigation dataset...")
stages = ['Initial', 'Mid', 'Late']
weathers = ['Sunny', 'Cloudy', 'Rainy']

data_irrigation = {
    'Weather': np.random.choice(weathers, n_samples),
    'Soil_Moisture': np.random.uniform(10, 80, n_samples),
    'Temperature': np.random.uniform(15, 42, n_samples),
    'Humidity': np.random.uniform(30, 90, n_samples),
    'Crop_Stage': np.random.choice(stages, n_samples)
}
df_irr = pd.DataFrame(data_irrigation)

def calculate_water_requirement(row):
    base_water = 15.0
    weather_impact = {'Sunny': 1.4, 'Cloudy': 0.9, 'Rainy': 0.1}
    moisture_factor = max(0, 1.0 - (row['Soil_Moisture'] / 70.0))
    temp_factor = 1.0 + (row['Temperature'] - 25) / 50.0
    stage_impact = {'Initial': 0.8, 'Mid': 1.5, 'Late': 1.0}
    
    water = base_water * weather_impact[row['Weather']] * moisture_factor * temp_factor * stage_impact[row['Crop_Stage']]
    water += np.random.normal(0, 1.0)
    return max(0.0, water)

df_irr['Water_Needed'] = df_irr.apply(calculate_water_requirement, axis=1)
df_irr.to_csv("datasets/irrigation_data.csv", index=False)

# Train Model
print("Training Smart Irrigation model...")
df_irr_encoded = pd.get_dummies(df_irr, columns=['Weather', 'Crop_Stage'])
X_i = df_irr_encoded.drop('Water_Needed', axis=1)
y_i = df_irr_encoded['Water_Needed']

X_train_i, X_test_i, y_train_i, y_test_i = train_test_split(X_i, y_i, test_size=0.2, random_state=42)
model_irr = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
model_irr.fit(X_train_i, y_train_i)

y_pred_i = model_irr.predict(X_test_i)
print(f"Irrigation Model -> RMSE: {np.sqrt(mean_squared_error(y_test_i, y_pred_i)):.4f}")

irr_payload = {
    'model': model_irr,
    'features': list(X_i.columns)
}
with open("models/irrigation_model.pkl", "wb") as f:
    pickle.dump(irr_payload, f)


# ==========================================
# 5. CROP DISEASE & PEST DETECTION MODELS (ONNX + Pickle fallback)
# ==========================================
print("Training CV Models using Scikit-Learn Classifier and downloading MobileNetV3 ONNX...")

disease_classes = [
    'Tomato_Healthy', 'Tomato_EarlyBlight', 'Tomato_LateBlight',
    'Corn_Healthy', 'Corn_CommonRust', 'Corn_GrayLeafSpot',
    'Rice_Healthy', 'Rice_BrownSpot', 'Rice_Blast',
    'Cotton_Healthy', 'Cotton_FungalRot',
    'Potato_Healthy', 'Potato_EarlyBlight', 'Potato_LateBlight'
]

pest_classes = [
    'Aphids', 'Armyworm', 'Bollworm', 'Grasshopper', 'SpiderMites', 'StemBorer'
]

def train_and_export_image_classifier(classes, model_name):
    # Train normal fallback Pickle classifier
    n_samples_per_class = 25
    features = []
    labels = []
    
    for i, cls in enumerate(classes):
        for _ in range(n_samples_per_class):
            img_flat = np.random.normal(0.5, 0.1, 3072)
            if 'Healthy' in cls:
                img_flat[1::3] += 0.2
            elif 'Blight' in cls or 'Rot' in cls:
                img_flat[0::3] += 0.15
                img_flat[1::3] += 0.10
                img_flat[2::3] -= 0.15
            elif 'Rust' in cls:
                img_flat[0::3] += 0.25
                img_flat[1::3] += 0.05
            img_flat = np.clip(img_flat, 0, 1)
            features.append(img_flat)
            labels.append(i)
            
    X_img = np.array(features)
    y_img = np.array(labels)
    
    le_cv = LabelEncoder()
    y_encoded_cv = le_cv.fit_transform(y_img)
    
    clf = XGBClassifier(n_estimators=50, max_depth=4, random_state=42)
    clf.fit(X_img, y_encoded_cv)
    
    # Save pickle fallback
    payload = {
        'model': clf,
        'classes': classes
    }
    with open(f"models/{model_name}.pkl", "wb") as f:
        pickle.dump(payload, f)
    print(f"Saved fallback pickle model: models/{model_name}.pkl successfully.")
    
    # Save classes metadata for ONNX matching
    with open(f"models/{model_name}_classes.json", "w") as f:
        json.dump(classes, f)
        
    # Attempt to download MobileNetV3 ONNX model
    onnx_dest = f"models/{model_name}.onnx"
    # MobileNetV3 Large ONNX model from standard repository
    url = "https://github.com/onnx/models/raw/main/validated/vision/classification/mobilenet/model/mobilenetv3-large-100.onnx"
    try:
        print(f"Attempting to download pre-trained MobileNetV3 ONNX model to {onnx_dest}...")
        response = requests.get(url, timeout=12)
        if response.status_code == 200:
            with open(onnx_dest, "wb") as f:
                f.write(response.content)
            print(f"Downloaded and saved MobileNetV3 ONNX model to {onnx_dest} successfully.")
        else:
            print(f"ONNX Model download failed (HTTP status {response.status_code}). Using pickle fallback.")
    except Exception as e:
        print(f"Could not download ONNX model: {e}. Pickle fallback will be active.")

train_and_export_image_classifier(disease_classes, "disease_model")
train_and_export_image_classifier(pest_classes, "pest_model")

print("All ML models generated and saved successfully!")
