
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import torch
import pickle
from datetime import datetime
from pytorch_forecasting import GroupNormalizer, TimeSeriesDataSet, TemporalFusionTransformer
from flask_cors import CORS

import warnings
warnings.filterwarnings("ignore")

# app instance
app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Configuration variables
MODEL_PATH = "./model/best_tft_model.ckpt" 
SCALER_PATH = "./model/scaler.pkl"
HISTORICAL_DATA_PATH = "./dataset/crypto_prices_exogenous_v2.csv" 


# Hyperparameters (must match what was used during training)
max_encoder_length = 365  # Number of past time steps
max_prediction_length = 30  # Forecast horizon

# Load the trained TFT model
device = torch.device("cpu")
model = TemporalFusionTransformer.load_from_checkpoint(MODEL_PATH, map_location=device)
model.eval()

# Load the scaler
with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

# Load historical data (encoder part)
historical_data = pd.read_csv(HISTORICAL_DATA_PATH, parse_dates=["Date"])

# Ensure categorical features are set properly
historical_data["month"] = historical_data["month"].astype("category")
historical_data["day_of_week"] = historical_data["day_of_week"].astype("category")
historical_data["quarter"] = historical_data["quarter"].astype("category")

import torch
import numpy as np

def inverse_transform(data, scaler, feature_idx=0):
    """
    Inverse transform predictions from scaled to original values.
    """
    # Explicitly check if data is a torch.Tensor and move to CPU if needed
    if isinstance(data, torch.Tensor):
        data = data.cpu()
        
    # Now convert to a numpy array
    data_numpy = data.numpy() if hasattr(data, "numpy") else np.array(data)
    
    if len(data_numpy.shape) == 1:
        data_reshaped = data_numpy.reshape(-1, 1)
    elif len(data_numpy.shape) == 2:
        data_reshaped = data_numpy
    elif len(data_numpy.shape) == 3:
        n_samples, n_timesteps, n_quantiles = data_numpy.shape
        data_reshaped = data_numpy.reshape(-1, n_quantiles)
    else:
        raise ValueError(f"Unexpected data shape: {data_numpy.shape}")
    
    # Create a dummy array for inverse scaling (assuming target is at column index feature_idx)
    dummy = np.zeros((data_reshaped.shape[0], scaler.n_features_in_))
    dummy[:, feature_idx] = data_reshaped[:, 0]
    data_unscaled = scaler.inverse_transform(dummy)[:, feature_idx]
    
    if len(data_numpy.shape) == 1:
        return data_unscaled
    elif len(data_numpy.shape) == 2:
        return data_unscaled.reshape(data_numpy.shape[0], -1)
    elif len(data_numpy.shape) == 3:
        return data_unscaled.reshape(n_samples, n_timesteps)
    
    return data_unscaled

def create_prediction_data(future_df):
    """
    Combine the last encoder data with the new decoder (future) data.
    The future_df DataFrame is created from the JSON input and must include a 'date'
    column and forecasted values for the known covariates.
    """
    # rename the date column to match the historical data
    future_df.rename(columns={"date": "Date"}, inplace=True)

    # Ensure the date column is datetime
    future_df["Date"] = pd.to_datetime(future_df["Date"])
    
    # For the decoder, assign the forecasted known reals and add dummy values (NaN) for unknowns
    decoder_data = future_df.copy()
    # Set unknown columns (the target and its derived features) as NaN since they are to be predicted
    unknown_columns = [
        "BTC_Price", "BTC_Volatility",
        "BTC_7day_momentum", "BTC_14day_momentum",
        "BTC_30day_momentum", "RSI_14"
    ]
    for col in unknown_columns:
        decoder_data[col] = np.nan

    # Compute time-based categorical features from the date
    decoder_data["month"] = decoder_data["Date"].dt.month.astype(str).astype("category")
    decoder_data["day_of_week"] = decoder_data["Date"].dt.dayofweek.astype(str).astype("category")
    decoder_data["quarter"] = decoder_data["Date"].dt.quarter.astype(str).astype("category")
    decoder_data["id"] = "BTC"  # static group id
    
    # Compute time index for decoder_data (using a monthly time index here as an example)
    # decoder_data["time_idx"] = decoder_data["date"].dt.year * 12 + decoder_data["date"].dt.month
    decoder_data['time_idx'] = range(len(decoder_data))

    # Select the encoder data (last max_encoder_length rows from historical data)
    encoder_data = historical_data[
        historical_data["time_idx"] > historical_data["time_idx"].max() - max_encoder_length
    ].copy()
    
    # Adjust decoder time_idx so that it continues from encoder_data
    decoder_data["time_idx"] += (encoder_data["time_idx"].max() + 1 - decoder_data["time_idx"].min())

    # scale before merge
    num_features = ["BTC_Price", "BTC_Market_Cap", "Gold_Price", "NASDAQ_Price", "SP_500_Price", "IGREA", "interest_rate", "BTC_Volatility",
                "BTC_7day_momentum", "BTC_14day_momentum", "BTC_30day_momentum", "RSI_14"]
    # decoder_data = decoder_data.reindex(columns=num_features, fill_value=0)
    decoder_data[num_features] = scaler.transform(decoder_data[num_features])

    # Combine encoder and decoder data
    new_prediction_data = pd.concat([encoder_data, decoder_data], ignore_index=True)

    new_prediction_data["month"] = new_prediction_data["month"].astype(str).astype("category")
    new_prediction_data["day_of_week"] = new_prediction_data["day_of_week"].astype(str).astype("category")
    new_prediction_data["quarter"] = new_prediction_data["quarter"].astype(str).astype("category")

    new_prediction_data.fillna(method='ffill', inplace=True)

    # new_prediction_data['time_idx'] = range(len(new_prediction_data))

    return new_prediction_data

def create_prediction_dataloader(new_prediction_data):
    """
    Create a TimeSeriesDataSet and then a dataloader for prediction,
    using the same configuration as during training.
    """
    prediction_dataset = TimeSeriesDataSet(
        new_prediction_data,
        time_idx="time_idx",
        target="BTC_Price",
        group_ids=["id"],
        max_encoder_length=365,
        max_prediction_length=30,
        static_categoricals=["id"],
        time_varying_known_categoricals=["month", "day_of_week", "quarter"],
        static_reals=[],
        time_varying_known_reals=["BTC_Market_Cap", "Gold_Price", "NASDAQ_Price", "SP_500_Price", "IGREA", "interest_rate"],
        time_varying_unknown_reals=[
            "BTC_Price", "BTC_Volatility", "BTC_7day_momentum",
            "BTC_14day_momentum", "BTC_30day_momentum", "RSI_14"
        ],
        target_normalizer=GroupNormalizer(groups=["id"], transformation="softplus"),  # assuming scaling is handled separately
        add_relative_time_idx=True,
        add_target_scales=True,
        add_encoder_length=True,
    )
    return prediction_dataset.to_dataloader(train=False, batch_size=128)

# endpoint to receive future data and return predictions
@app.route("/api/predict", methods=["POST"])
def predict():
    json_data = request.get_json()
    future_data = json_data.get("future", [])

    if not future_data:
        return jsonify({"error": "No future data provided"}), 400
    
    future_df = pd.DataFrame(future_data)

    # Build the full prediction DataFrame
    new_prediction_data = create_prediction_data(future_df)

    # Create the prediction dataloader
    prediction_dataloader = create_prediction_dataloader(new_prediction_data)

    # Run prediction on CPU
    try:
        with torch.no_grad():
            predictions = model.predict(
                prediction_dataloader,
                mode="raw",
                return_x=True,
                trainer_kwargs={"accelerator": "cpu"}
            )
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

    # Access predictions
    predictions_tensor = predictions.output.prediction  # Shape: [1, 30, 7]
    forecast_prices_scaled = predictions_tensor[0]  # Shape: [30, 7]

    # Define the quantile levels (adjust based on your training setup)
    quantile_levels = [0.1, 0.5, 0.9]  # Example: 7 quantiles

    # Inverse transform all 7 quantiles
    forecast_prices_unscaled = []
    for quantile_idx in range(3):  # Loop over 7 quantiles
        quantile_scaled = forecast_prices_scaled[:, quantile_idx]  # Shape: [30]
        quantile_unscaled = inverse_transform(quantile_scaled, scaler, feature_idx=0)
        forecast_prices_unscaled.append(quantile_unscaled)

    forecast_prices_unscaled = np.array(forecast_prices_unscaled)  # Shape: [7, 30]

    # Extract forecast dates
    forecast_dates = new_prediction_data["Date"].tail(max_prediction_length).tolist()

    # Combine into forecast with all quantiles
    forecast = []
    for t in range(len(forecast_dates)):  # Loop over 30 time steps
        date = forecast_dates[t].strftime("%Y-%m-%d")
        quantiles_dict = {
            f"quantile_{quantile_levels[q]:.1f}".replace('.', '_'): float(forecast_prices_unscaled[q, t])
            for q in range(len(quantile_levels))
        }
        forecast.append({"date": date, "predictions": quantiles_dict})

    return jsonify({"predictions": forecast})

@app.route('/api/home', methods=['GET'])
def return_home():
    return jsonify({"message": "Welcome to the home page!"})

@app.route('/api/historical', methods=['GET'])
def historical():
    # Select only Date and BTC_Price columns from the historical data
    data = historical_data[["Date", "BTC_Price"]].copy()
    
    # Create a dummy array with zeros with shape (n_samples, n_features)
    dummy = np.zeros((data.shape[0], scaler.n_features_in_))
    
    # Insert the scaled BTC_Price values into the appropriate column (assumed index 0)
    dummy[:, 0] = data["BTC_Price"].values
    
    # Apply inverse scaling to recover the original BTC_Price values
    unscaled_dummy = scaler.inverse_transform(dummy)
    
    # Replace the BTC_Price column with the unscaled values
    data["BTC_Price"] = unscaled_dummy[:, 0]
    
    # Format the Date column to string format (YYYY-MM-DD)
    data["Date"] = data["Date"].dt.strftime("%Y-%m-%d")
    
    return jsonify({"historical": data.to_dict(orient="records")})


if __name__ == "__main__":
    app.run(debug=True)
    print("app is up and running")