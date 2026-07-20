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

## Example request

```json
POST /predict

{
  "Gender": "Female",
  "Customer_Type": "Loyal Customer",
  "Age": 34,
  "Type_of_Travel": "Business travel",
  "Class": "Business",
  "Flight_Distance": 1200,
  "Inflight_wifi_service": 4,
  "Departure_Arrival_time_convenient": 3,
  "Ease_of_Online_booking": 4,
  "Gate_location": 3,
  "Food_and_drink": 4,
  "Online_boarding": 5,
  "Seat_comfort": 4,
  "Inflight_entertainment": 4,
  "Onboard_service": 5,
  "Leg_room_service": 4,
  "Baggage_handling": 5,
  "Checkin_service": 4,
  "Inflight_service": 5,
  "Cleanliness": 4,
  "Arrival_Delay_in_Minutes": 10
}
```

**Response:**
```json
{
  "prediction": "satisfied"
}
```

## Run locally (optional)

The project is already live, so this is only needed if you want to run or modify the code yourself.

1. Clone the repo
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```

2. Install the dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Run the API
   ```bash
   uvicorn main:app --reload
   ```

4. Open `http://127.0.0.1:8000/docs` to test it out.

## Dataset

Trained on the [Airline Passenger Satisfaction dataset](https://www.kaggle.com/datasets/teejmahal20/airline-passenger-satisfaction) from Kaggle.
