import { Bar } from "react-chartjs-2";
import { mainBoxStyles } from "../styles";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { faker } from "@faker-js/faker";
import { COLOURS } from "../../../../config/colours";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  maintainAspectRatio: false,
  indexAxis: "y",
  elements: {
    bar: {
      borderWidth: 1,
    },
  },
  responsive: true,
  // plugins: {
  //   legend: {
  //     position: "right",
  //   },
  //   title: {
  //     display: true,
  //     text: "Chart.js Horizontal Bar Chart",
  //   },
  // },
};

const labels = ["Red", "Green", "Blue"];

export const data = {
  labels,
  datasets: [
    {
      label: "Primary",
      data: labels.map(() => faker.datatype.number({ min: 0, max: 100 })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgb(255, 99, 132, 0.5)",
    },
    {
      label: "Secondary",
      data: labels.map(() => faker.datatype.number({ min: 0, max: 100 })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

const SpatialPedagogyViz = ({ type }) => {
  return (
    <div style={mainBoxStyles.container}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default SpatialPedagogyViz;
