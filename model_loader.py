import joblib

model = joblib.load("model/model.pkl")
transformer = joblib.load("model/transformer.pkl")
scaler = joblib.load("model/scaler.pkl")
feature_names = joblib.load("model/features.pkl")