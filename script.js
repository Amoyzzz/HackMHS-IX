let xValues = [];
let absAccel = [];
let xAccel = [];
let yAccel = [];
let zAccel = [];
let intervalId;

document.getElementById('startButton').addEventListener('click', startScript);
document.getElementById('stopButton').addEventListener('click', stopScript);

async function startScript() {
    try {
        const response = await fetch('/start', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to start script.');
        }
        console.log('Script started.');
        // Start fetching data and updating chart after script is started
        intervalId = setInterval(fetchDataAndUpdateChart, 1000); // Adjust the interval as needed
    } catch (error) {
        console.error('Error starting script:', error);
    }
}

async function stopScript() {
    try {
        const response = await fetch('/stop', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to stop script.');
        }
        console.log('Script stopped.');
        // Stop fetching data and updating chart after script is stopped
        clearInterval(intervalId);
    } catch (error) {
        console.error('Error stopping script:', error);
    }
}

async function fetchDataAndUpdateChart() {
    try {
        const response = await fetch('http://localhost:8000'); // Adjust URL as needed
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log('Received data:', data); // Log the received data

        const accData = data.acc;
        const accDataX = data.accX;
        const accDataY = data.accY;
        const accDataZ = data.accZ;

        xValues.push(new Date().toLocaleTimeString()); // Add timestamp for x-axis
        absAccel.push(accData);
        xAccel.push(accDataX);
        yAccel.push(accDataY);
        zAccel.push(accDataZ);

        updateChart(xValues, absAccel, xAccel, yAccel, zAccel);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateChart(xValues, accData, accDataX, accDataY, accDataZ) {
    const chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels: xValues,
            datasets: [
                {
                    label: 'Acc',
                    data: accData,
                    borderColor: "red",
                    fill: false
                },
                {
                    label: 'AccX',
                    data: accDataX,
                    borderColor: "green",
                    fill: false
                },
                {
                    label: 'AccY',
                    data: accDataY,
                    borderColor: "blue",
                    fill: false
                },
                {
                    label: 'AccZ',
                    data: accDataZ,
                    borderColor: "orange",
                    fill: false
                }
            ]
        },
        options: {
            legend: { display: true }
        }
    });
}

updateChart();
