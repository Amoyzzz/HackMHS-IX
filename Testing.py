import requests as r
import json
import time
import numpy as np
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading

# Define the port on which the server will listen
PORT = 8000

# Global variables to store data
start_time = time.time()
data_dict = {}
movement_detected = False
movement_times = []
movement_intervals = []
sampling_interval = 0.1  # Sampling interval in seconds
url = 'http://172.20.10.1/get?'
what_to_get = ['acc', 'accX', 'accY', 'accZ']

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_GET(self):
        if self.path == '/get_data':
            self._set_headers()
            acc_data = phyphox_data()
            data = {
                'acc': acc_data['acc'],
                'accX': acc_data['accX'],
                'accY': acc_data['accY'],
                'accZ': acc_data['accZ']
            }
            self.wfile.write(json.dumps(data).encode())
        elif self.path == '/save_data_times':
            self._set_headers()
            save_to_file(movement_times, "movement_times.json")
            response = {'status': 'Times Data saved successfully'}
            self.wfile.write(json.dumps(movement_times).encode())

def phyphox_data():
    global start_time
    response = r.get(url + '&'.join(what_to_get)).text
    data = json.loads(response)
    
    acc_data = data['buffer'][what_to_get[0]]['buffer'][0]
    acc_dataX = data['buffer'][what_to_get[1]]['buffer'][0]
    acc_dataY = data['buffer'][what_to_get[2]]['buffer'][0]
    acc_dataZ = data['buffer'][what_to_get[3]]['buffer'][0]
    
    # Apply high pass filter to data
    if acc_data < 0.5:
        acc_data = 0
    if acc_dataX < 0.5:
        acc_dataX = 0
    if acc_dataY < 0.5:
        acc_dataY = 0
    if acc_dataZ < 0.5:
        acc_dataZ = 0
    current_time = time.time() - start_time

    # Append data to dictionary
    data_dict[current_time] = {'acc': acc_data, 'accX': acc_dataX, 'accY': acc_dataY, 'accZ': acc_dataZ}
    
    print(f'Time: {current_time:.2f}s, Acceleration: {acc_data}')
    return data_dict[current_time]

def fastFourierTransform(time_acc_dict):
    # Extract time and acceleration values from the dictionary
    time_values = np.array(list(time_acc_dict.keys()))
    acceleration_values = np.array([data['acc'] for data in time_acc_dict.values()])

    # Compute the FFT of acceleration values
    fft_result = np.fft.fft(acceleration_values)

    # Compute the corresponding frequencies
    dt = time_values[1] - time_values[0]  # Assuming uniform time spacing
    frequencies = np.fft.fftfreq(len(time_values), dt)

    return frequencies, fft_result

def save_to_file(data, filename="movement_data.json"):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}')
    httpd.serve_forever()

# Start the server in a separate thread
server_thread = threading.Thread(target=run, kwargs={'port': PORT})
server_thread.daemon = True
server_thread.start()

while True:
    phyphox_data()
    time.sleep(sampling_interval)
# # Save movement intervals and times to a file
# save_to_file(movement_times, "movement_times.json")
# save_to_file(movement_intervals, "movement_intervals.json")
