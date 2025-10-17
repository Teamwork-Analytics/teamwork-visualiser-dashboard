import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { simulationColoursSetting, DEFAULT_COLOUR_SETTING } from "../../config/simulation";

const Barchart = ({
  data,
  height = "25vh",
  width = "40vw",
  yLabelsFontSize,
  customAspectRatio,
  nurseNameMatcher,
}) => {

  // Filtered not participants data. Participant data is in simulation.js config file.
  data.push({label: "black", value: 1})
  const filteredData = data.filter(value => value.label.toUpperCase() in simulationColoursSetting);

  const labels =  filteredData.map((row) => row.label);
  const labelNames = []

  const maxValue = filteredData.reduce((x,y) => x.value > y.value ? x : y).value;
  const backgroundColors = []

  labels.forEach(key => {
    let colourObject = simulationColoursSetting[key.toUpperCase()];

    if (!colourObject) colourObject = DEFAULT_COLOUR_SETTING;

    if (Object.keys(nurseNameMatcher).length > 0 && nurseNameMatcher[colourObject.LONG_TITLE] != "") {
      labelNames.push(nurseNameMatcher[colourObject.LONG_TITLE]);
    } else {
      labelNames.push(colourObject.SHORT_TITLE);
    }
    backgroundColors.push(colourObject.COLOUR);

  });

  const chartData = {
    labels: labelNames,
    datasets: [
      {
        data: filteredData.map((row) => row.value),
        backgroundColor: backgroundColors,
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
                return Math.round(value) + "%";
              },
              textAlign: "end",
              align: "end",
              anchor: "end",
              offset: (context) => {
                const index = context.dataIndex;
                const value = context.dataset.data[index];
                return value < maxValue * 0.1  ? "1" : "-33";
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
                text: "Speaking Time (%)",
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
                text: "Role",
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
