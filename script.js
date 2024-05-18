async function fetchDataAndUpdateChart() {
  const response = await fetch('acceleration_data.txt');
  const data = await response.text();
  const { xValues, accData, accDataX, accDataY, accDataZ } = parseData(data);

  // Update the chart
  updateChart(xValues, accData, accDataX, accDataY, accDataZ);
}

function updateChart(xValues, accData, accDataX, accDataY, accDataZ) {
  const chart = new Chart("chart", {
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

function parseData(data) {
  const lines = data.trim().split('\n');
  const xValues = [];
  const accData = [];
  const accDataX = [];
  const accDataY = [];
  const accDataZ = [];

  lines.forEach(line => {
      const [time, acc, accX, accY, accZ] = line.split(',').map(Number);
      xValues.push(time);
      accData.push(acc);
      accDataX.push(accX);
      accDataY.push(accY);
      accDataZ.push(accZ);
  });

  return { xValues, accData, accDataX, accDataY, accDataZ };
}

// Initial fetch and update
fetchDataAndUpdateChart();

// Set interval to fetch and update every second
setInterval(fetchDataAndUpdateChart, 1000);
