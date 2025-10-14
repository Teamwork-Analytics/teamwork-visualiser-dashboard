import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { cssColourMatcher } from "../../config/colours";

const labelsToText = {
  "allocation_self": "Self-allocating tasks",
  "allocation_others": "Allocating tasks to others",
  "sharing_information": "Sharing information",
  "consumer_care": "Patient interaction",
  "escalation": "Escalation",
  "questioning": "Questioning",
  "acknowledging": "Acknowledging",
}

const Barchart = ({
  data,
  height = "25vh",
  width = "40vw",
  yLabelsFontSize,
  customAspectRatio,
}) => {

  const labels =  data.map((row) => row.label);
  const maxValue = data.reduce((x,y) => x.value > y.value ? x : y).value;

  const labelsText = labels.map((label) => label in labelsToText ? labelsToText[label] : label);
  
  const chartData = {
    labels: labelsText,
    datasets: [
      {
        data: data.map((row) => row.value),
        backgroundColor: "#3a3a3a"  //rgba(30,144,255, 0.8), "#8856a7",
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
        plugins={[ChartDataLabels]}
        options={{
          indexAxis: "y",
          plugins: {
            datalabels: {
              color: (context) => {
                const index = context.dataIndex;
                const value = context.dataset.data[index];
                return value < maxValue * 0.1 ? "#000000" : "#ffffff";
              },
              formatter: function (value, context) {
                return Math.round(value);
              },
              textAlign: "end",
              align: "end",
              anchor: "end",
              offset: (context) => {
                const index = context.dataIndex;
                const value = context.dataset.data[index];
                return value < maxValue * 0.1 ? "1" : "-20";
              },
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
                display: true,
                text: "Frequency",
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
                text: "Behaviour Name",
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
