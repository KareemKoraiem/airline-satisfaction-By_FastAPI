from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
import pandas as pd


app = FastAPI(
    title="Airline Satisfaction Prediction API",
    description="Predict whether a passenger is satisfied or not.",
    version="1.0.0"
)

from model_loader import (
    model,
    transformer,
    scaler,
    feature_names
)

class Passenger(BaseModel):
    Gender: str
    Customer_Type: str
    Age: int
    Type_of_Travel: str
    Class: str
    Flight_Distance: int
    Inflight_wifi_service: int
    Departure_Arrival_time_convenient: int
    Ease_of_Online_booking: int
    Gate_location: int
    Food_and_drink: int
    Online_boarding: int
    Seat_comfort: int
    Inflight_entertainment: int
    On_board_service: int
    Leg_room_service: int
    Baggage_handling: int
    Checkin_service: int
    Inflight_service: int
    Cleanliness: int
    Arrival_Delay_in_Minutes: int

@app.get("/")
def home():
    return {
        "message": "Airline Satisfaction API",
        "status": "Running"
    }

@app.post("/predict")
def predict(passenger: Passenger):
    try:
        data = {
            "Gender": passenger.Gender,
            "Customer Type": passenger.Customer_Type,
            "Age": passenger.Age,
            "Type of Travel": passenger.Type_of_Travel,
            "Class": passenger.Class,
            "Flight Distance": passenger.Flight_Distance,
            "Inflight wifi service": passenger.Inflight_wifi_service,
            "Departure/Arrival time convenient": passenger.Departure_Arrival_time_convenient,
            "Ease of Online booking": passenger.Ease_of_Online_booking,
            "Gate location": passenger.Gate_location,
            "Food and drink": passenger.Food_and_drink,
            "Online boarding": passenger.Online_boarding,
            "Seat comfort": passenger.Seat_comfort,
            "Inflight entertainment": passenger.Inflight_entertainment,
            "On-board service": passenger.On_board_service,
            "Leg room service": passenger.Leg_room_service,
            "Baggage handling": passenger.Baggage_handling,
            "Checkin service": passenger.Checkin_service,
            "Inflight service": passenger.Inflight_service,
            "Cleanliness": passenger.Cleanliness,
            "Arrival Delay in Minutes": passenger.Arrival_Delay_in_Minutes
        }

        df = pd.DataFrame([data])

        df = df[feature_names]

        df = transformer.transform(df)

        df = scaler.transform(df)

        prediction = model.predict(df)[0]

        result = "Satisfied" if prediction == 1 else "Neutral or Dissatisfied"

        return {
            "prediction": int(prediction),
            "result": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )