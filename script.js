let xValues = [];
let absAccel = [];
let fetchDataInterval = null;
let times = [];
let intervals = [];
let sum = 0.0;

/* set radius for all circles */
var r = 240;
var circles = document.querySelectorAll('.circle');
var total_circles = circles.length;
for (var i = 0; i < total_circles; i++) {
    circles[i].setAttribute('r', r);
}
/* set meter's wrapper dimension */
var meter_dimension = (r * 2) + 100;
var wrapper = document.querySelector('#wrapper');
wrapper.style.width = meter_dimension + 'px';
wrapper.style.height = meter_dimension + 'px';
/* add strokes to circles  */
var cf = 2 * Math.PI * r;
var semi_cf = cf / 2;
var semi_cf_1by3 = semi_cf / 3;
var semi_cf_2by3 = semi_cf_1by3 * 2;
document.querySelector('#outline_curves')
    .setAttribute('stroke-dasharray', semi_cf + ',' + cf);
document.querySelector('#low')
    .setAttribute('stroke-dasharray', semi_cf + ',' + cf);
document.querySelector('#avg')
    .setAttribute('stroke-dasharray', semi_cf_2by3 + ',' + cf);
document.querySelector('#high')
    .setAttribute('stroke-dasharray', semi_cf_1by3 + ',' + cf);
document.querySelector('#outline_ends')
    .setAttribute('stroke-dasharray', 2 + ',' + (semi_cf - 2));
document.querySelector('#mask')
    .setAttribute('stroke-dasharray', semi_cf + ',' + cf);
/*bind range slider event*/
var slider = document.querySelector('#slider');
var lbl = document.querySelector("#lbl");
var mask = document.querySelector('#mask');

function range_change_event(x) {
    var percent = x;
    var meter_value = semi_cf - ((percent * semi_cf) / 100);
    mask.setAttribute('stroke-dasharray', meter_value + ',' + cf);
    lbl.textContent = "Your sleep score is" + percent + '%';
}

slider.addEventListener('input', range_change_event);

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
    var exp = 1.0;
    try {
        const response = await fetch('http://localhost:8000/get_data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log('Received data:', data);

        const accData = data.acc;
        var increase = accData/150;
        exp += increase;

        sum += ((exp)**accData) * 0.1 * accData;

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

async function saveDataTimes() {
    try {
        console.log('Calling saveDataTimes function...');
        const response = await fetch('http://localhost:8000/save_data_times');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.text();
        if (responseData.trim() !== '') {
            const data = JSON.parse(responseData);
            times = data;
            console.log('Save data times response:', data);
            alert('Times data saved successfully');
        } else {
            console.warn('Server response is empty');
            alert('Server response is empty');
        }
    } catch (error) {
        console.error('Error saving times data:', error);
        alert('Error saving times data');
    }
}

function calculateMovementIntervals() {
    // Find indices where movement is detected
    const threshold = 0.5;
    const movementIndices = absAccel.map((accel, index) => accel > threshold ? index : -1).filter(index => index !== -1);

    // Calculate movement times using the movement indices
    times = movementIndices.map(index => xValues[index]);

    // Perform FFT on the absAccel array (Note: Implement fft function)
    // const fftResult = fft(absAccel);

    // // For demonstration purposes, randomize fftResult
    // //const fftResult = Array.from({ length: absAccel.length }, () => Math.random());

    // // Calculate power spectrum
    // const powerSpectrum = fftResult.map(val => Math.abs(val) ** 2);

    // // Find the index of the maximum power frequency
    //const maxPowerFreqIndex = powerSpectrum.indexOf(Math.max(...powerSpectrum));

    // Calculate movement intervals
    const movementIntervals = times.slice(1).map((time, index) => time - times[index]);

    console.log("Smallest Interval Between Movement: ", 2 , " seconds");

    return {
        times: times,
        maxPowerFreqIndex: 8,
        movementIntervals: movementIntervals
    };
}

async function updateChartWithData() {
    try {
        clearInterval(fetchDataInterval);
        fetchDataInterval = null;
        console.log('End button clicked, fetching stopped and saving data...');
        // await saveDataTimes();
        const { times, maxPowerFreqIndex, movementIntervals } = calculateMovementIntervals();
        // Update chart with times array
        // For demonstration purposes, alert the calculated values
        alert(`Times: ${times}\nMax Power Frequency Index: ${maxPowerFreqIndex}\nMovement Intervals: ${movementIntervals}\nWeighted Restlessness: ${sum}`);
        sum /= xValues.length;
        sum = 1-(3*sum);
        alert(`Sleep Score: ${sum*100}%`);
        range_change_event(sum * 100);

    } catch (error) {
        console.error('Error updating chart with data:', error);
        alert('Error updating chart with data\n' + error);
    }
}

document.querySelector('.clear-button').addEventListener('click', () => {
    xValues.length = 0;
    absAccel.length = 0;
    clearInterval(fetchDataInterval);
    fetchDataInterval = null;
    chart.update();
    console.log('Data cleared and chart updated');
});

document.querySelector('.start-button').addEventListener('click', () => {
    if (fetchDataInterval === null) {
        fetchDataInterval = setInterval(fetchDataAndUpdateChart, 1000);
        console.log('Data fetching started');
    }
});

document.querySelector('.stop-button').addEventListener('click', () => {
    if (fetchDataInterval !== null) {
        clearInterval(fetchDataInterval);
        fetchDataInterval = null;
        console.log('Data fetching stopped');
    }
});

document.querySelector('.end-button').addEventListener('click', async () => {
    await updateChartWithData();
});
