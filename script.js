let xValues = [];
let absAccel = [];
let xAccel = [];
let yAccel = [];
let zAccel = [];

async function fetchDataAndUpdateChart() {
    try {
        const response = await fetch('http://localhost:8000'); // Adjust URL as needed
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();h

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
                }
                // {
                //     label: 'AccX',
                //     data: accDataX,
                //     borderColor: "green",
                //     fill: false
                // },
                // {
                //     label: 'AccY',
                //     data: accDataY,
                //     borderColor: "blue",
                //     fill: false
                // },
                // {
                //     label: 'AccZ',
                //     data: accDataZ,
                //     borderColor: "orange",
                //     fill: false
                // }
            ]
        },
        options: {
            legend: { display: true }
        }
    });
}
updateChart();
// Call fetchDataAndUpdateChart to fetch data and update the chart periodically
setInterval(fetchDataAndUpdateChart, 1000); // Adjust the interval as needed