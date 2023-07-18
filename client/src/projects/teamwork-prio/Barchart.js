import { Bar } from "react-chartjs-2";
import { useTimeline } from "../observation/visualisationComponents/TimelineContext";
const Barchart = () => {
  const { teamworkData } = useTimeline();

  const chartData = {
    labels: teamworkData.map((row) => row.label),
    datasets: [
      {
        data: teamworkData.map((row) => row.value),
        backgroundColor: "rgba(30,144,255, 0.8)",
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: "25vh" }}>
      <Bar
        data={chartData}
        options={{
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              //https://www.chartjs.org/docs/3.9.1/axes/cartesian/linear.html
              // max: 100,
              // min: 0,
              title: {
                display: true,
                text: "Percentage (%)",
                //https://www.chartjs.org/docs/latest/general/fonts.html
                font: { size: 20 },
              },
            },
            x: {
              title: {
                display: true,
                text: "Behaviours",
                font: { size: 20 },
              },
            },
          },
        }}
      />
    </div>
  );
};

export default Barchart;
