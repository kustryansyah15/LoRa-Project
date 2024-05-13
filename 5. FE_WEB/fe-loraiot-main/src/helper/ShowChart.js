import { Line } from 'react-chartjs-2';

function ShowChart({ data, scale, mode}) {
  let titleText = '';
  let labelText = '';
  if (scale === 'Suhu') {
    labelText = 'Temp'
    titleText = 'Temperature vs Time';
  } else if (scale === 'RH'){
    labelText = 'RH'
    titleText = 'Relative Humidity vs Time';
  } else if (scale === 'SH'){
    labelText = 'SH'
    titleText = 'Soil Humidity vs Time';
  } else if (scale === 'IC'){
    labelText = 'IC'
    titleText = 'Light Intensity vs Time';
  }


  const chartData = {
    labels: data.map((d) => d.Waktu),
    datasets: [],
  };
  
  if (mode === "Avg"){
    chartData.datasets.push({
      label: `Avg ${labelText}`,
      data: data.map((d) => d[`${scale}_Mean`]),
    });
  } else if (mode === "Spot"){
    for (let i = 1; i <= 4; i++) {
      chartData.datasets.push({
        label: `${labelText}${i}`,
        data: data.map((d) => d[`${scale}${i}`]),
      });
    }
  } else if (mode === "All"){
    for (let i = 1; i <= 4; i++) {
      chartData.datasets.push({
        label: `${labelText}${i}`,
        data: data.map((d) => d[`${scale}${i}`]),
      });
    }

    chartData.datasets.push({
      label: `Avg ${labelText}`,
      data: data.map((d) => d[`${scale}_Mean`]),
    });
  }

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: `${titleText}`,
        font: {
          size: 20,
        },
        padding: {
          bottom: 10,
        },
      },
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        includeInvisible: true,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
}

export default ShowChart;
