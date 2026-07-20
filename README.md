#  Airline Passenger Satisfaction Predictor

A simple machine learning API built with **FastAPI** that predicts whether an airline passenger is satisfied or not, based on their flight and service experience. Built as a learning project to practice ML deployment.

**Live site:** https://airline-satisfaction.vercel.app/
**Streamlit demo:** https://airline-satisfaction-byapp-m3waaxmu6zabkwgtwqryya.streamlit.app/
**API docs:** https://airline-satisfaction-byfastapi-production.up.railway.app/docs

## Features

- Predict passenger satisfaction instantly
- Simple and responsive web interface
- FastAPI REST API
- Random Forest classifier
- Interactive API documentation

## Tech Stack

**Backend**
- FastAPI
- Pandas
- Scikit-learn (model, scaler, transformer)
- Joblib (for loading the saved model)

**Frontend**
- HTML
- CSS
- JavaScript
- Streamlit (alternative interface)

## What it does

You send flight details (class, travel type, delay, service ratings, etc.) to the API, and it returns whether the passenger is likely to be **satisfied** or **neutral/dissatisfied**, using a pre-trained ML model.

## Preprocessing

- Missing values handled
- One-Hot Encoding
- StandardScaler
- ColumnTransformer

## Model Selection

Several models were trained and compared before picking the final one, including:

- Logistic Regression
- KNN
- Decision Tree
- Random Forest
- Naive Bayes
- SVM
- AdaBoost
- Neural Network

**Random Forest** gave the best overall results and was chosen as the final model:

| Metric | Score |
|--------|-------|
| Train Score | 0.969 |
| Test Score | 0.960 |
| Cross Validation Mean | 0.958 |
| Accuracy | 0.960 |
| Precision | 0.967 |
| Recall | 0.941 |
| F1 Score | 0.954 |

## Dataset

Trained on the [Airline Passenger Satisfaction dataset](https://www.kaggle.com/datasets/teejmahal20/airline-passenger-satisfaction) from Kaggle.
