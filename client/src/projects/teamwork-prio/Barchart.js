import { Bar } from "react-chartjs-2";

const Barchart = ({
  data,
  height = "25vh",
  width = "40vw",
  yLabelsFontSize,
  customAspectRatio,
}) => {
  const chartData = {
    labels: data.map((row) => row.label),
    datasets: [
      {
        data: data.map((row) => row.value),
        backgroundColor: "rgba(30,144,255, 0.8)",
      },
    ],
  };

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
        options={{
          indexAxis: "y",
          plugins: {
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
                display: true,
                text: "Percentage (%)",
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

export default Barchart;
