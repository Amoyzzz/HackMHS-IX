let xValues = [];
let absAccel = [];
let fetchDataInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    const gaugeFill = document.querySelector('.gauge-fill');
    const gaugeText = document.querySelector('.gauge-text');

    // Set the percentage value
    const percentage = 22.4;

    // Calculate the rotation value for the fill
    const rotationValue = (percentage / 100) * 180;

    // Update the gauge fill rotation
    gaugeFill.style.transform = `rotate(${rotationValue}deg)`;

    // Update the gauge text
    gaugeText.textContent = `${percentage}%`;

    // Update the gauge color based on percentage
    const gauge = document.querySelector('.gauge');
    const gradientColor = `conic-gradient(#ff0000 ${percentage}%, #eee ${percentage}%)`;
    gauge.style.background = gradientColor;
});


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
        const response = await fetch('http://localhost:8000'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log('Received data:', data); 

        const accData = data.acc;

        xValues.push(new Date().toLocaleTimeString()); 
        absAccel.push(accData);

        const MAX_DATA_POINTS = 84600;
        if (xValues.length > MAX_DATA_POINTS) {
            xValues.shift();
            absAccel.shift();
        }

        chart.update();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

document.querySelector('.clear-button').addEventListener('click', () => {
    xValues.length = 0;
    absAccel.length = 0;
    clearInterval(fetchDataInterval);
    fetchDataInterval = null;
    chart.update();
});

document.querySelector('.start-button').addEventListener('click', () => {
    if (fetchDataInterval === null) {
        fetchDataInterval = setInterval(fetchDataAndUpdateChart, 1000); 
    }
});
document.querySelector('.stop-button').addEventListener('click', () => {
    if (fetchDataInterval !== null) {
        // alert('pased');
        clearInterval(fetchDataInterval);
        fetchDataInterval = null;
    }
});
document.querySelector('.end-button').addEventListener('click', () => {
    clearInterval(fetchDataInterval);
    fetchDataInterval = null;
    
    alert('Results');
});

