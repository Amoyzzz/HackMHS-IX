# server.py

from flask import Flask, jsonify, request
import time
import threading

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global variables to store data
fetchDataInterval = None

# Simulated data fetching function
def fetchDataAndUpdateChart():
    while True:
        # Simulated data update
        time.sleep(1)
        data = {
            'acc': 0.5 + time.time() % 2,  # Simulated acceleration data
        }
        yield data

@app.route('/phyphox_data_fetcher', methods=['POST'])
def start_phyphox_data_fetching():
    global fetchDataInterval
    if fetchDataInterval is None:
        # Start fetching data in a separate thread
        fetchDataInterval = threading.Thread(target=fetchDataAndUpdateChart)
        fetchDataInterval.daemon = True
        fetchDataInterval.start()
        return '', 200  # Return success status code
    else:
        return 'Data fetching already started', 400  # Return error status code

if __name__ == '__main__':
    app.run(debug=True)  # Run Flask server
