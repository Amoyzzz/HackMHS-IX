// Import Chart.js library if necessary
// import Chart from 'chart.js';

let xValues = [];
let absAccel = [];

// Initialize the chart once when the page loads
const chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
        labels: xValues,
        datasets: [{
            label: 'Acc',
            data: absAccel,
            borderColor: "red",
            fill: false
        }]
    },
    options: {
        legend: { display: true }
    }
});

async function fetchDataAndUpdateChart() {
    try {
        const response = await fetch('http://localhost:8000'); // Adjust URL as needed
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log('Received data:', data); // Log the received data

        const accData = data.acc;

        xValues.push(new Date().toLocaleTimeString()); // Add timestamp for x-axis
        absAccel.push(accData);

        // Limit the number of data points shown to prevent graph from becoming too crowded
        const MAX_DATA_POINTS = 84600;
        if (xValues.length > MAX_DATA_POINTS) {
            xValues.shift();
            absAccel.shift();
        }

        // Update the chart with new data
        chart.update();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call fetchDataAndUpdateChart to fetch data and update the chart periodically
setInterval(fetchDataAndUpdateChart, 1000); // Adjust the interval as needed
