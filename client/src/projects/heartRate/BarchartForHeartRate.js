import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

const BarchartForHeartRate = ({
  data,
  height = "25vh",
  width = "40vw",
  yLabelsFontSize,
  customAspectRatio,
}) => {

  const labels = Object.keys(data);
  const averages = []
  
  labels.forEach(key => averages.push(data[key].average));
  console.log('averages', averages)

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: averages,
        backgroundColor: "#3a3a3a"  //rgba(30,144,255, 0.8), "#8856a7",
      },
    ],
  };

  console.log('These are the entrres', data);

  return (
    <div
      style={{
        width: width,
        height: height,
        margin: "auto",
        textAlign: "center",
      }}
    >
      <Bar
        data={chartData}
        plugins={[ChartDataLabels]}
        options={{
          indexAxis: "y",
          plugins: {
            datalabels: {
              color: "#ffffff",
              formatter: function (value, context) {
                return Math.round(value);
              },
              textAlign: "end",
              align: "end",
              anchor: "end",
              offset: "-30"
            },
            legend: {
              labels: {
                font: { size: 10 },
              },
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              //https://www.chartjs.org/docs/3.9.1/axes/cartesian/linear.html
              // max: 100,
              // min: 0,
              title: {
                display: false,
                text: "Heart Rate",
                //https://www.chartjs.org/docs/latest/general/fonts.html
                font: { size: 18 },
              },
            },
            y: {
              grid: {
                display: false,
              },
              title: {
                display: true,
                text: "Behaviours",
                font: { size: 18 },
              },
              ticks: {
                font: { size: yLabelsFontSize },
              },
            },
          },
          aspectRatio: customAspectRatio,
        }}
      />
    </div>
  );
};

export default BarchartForHeartRate;
