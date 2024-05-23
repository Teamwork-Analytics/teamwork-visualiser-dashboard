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
import { PedagogyMapEnums, TeacherBackEndEnums } from "../enums";
import { useTimeline } from "../../../observation/visualisationComponents/TimelineContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCompleteCoTeachData } from "../../../../services/py-server";

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
  // scales: {
  //   x: {
  //     stacked: true,
  //   },
  //   y: {
  //     stacked: true,
  //   },
  // },
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

const SpatialPedagogyViz = ({ type }) => {
  const { range } = useTimeline();
  const { simulationId } = useParams();

  // const [pedagogyData, setPedagogyData] = useState([]);
  const [primaryData, setPrimaryData] = useState([]);
  const [secondaryData, setSecondaryData] = useState([]);
  const [isError, setIsError] = useState(primaryData.length === 0);

  const startTime = range[0];
  const endTime = range[1];

  const labels = ["Red TA", "Green TA", "Blue TA"];
  const pedLabels = PedagogyMapEnums[type];

  const cleanRawData = (data) => {
    let structure = {
      primary: { RED: 0, GREEN: 0, BLUE: 0 },
      secondary: { RED: 0, GREEN: 0, BLUE: 0 },
    };

    for (let pedagogy in data) {
      if (pedagogy === type) {
        for (let teacher in data[pedagogy]) {
          let temp = data[pedagogy][teacher];
          // const teacherColour = TeacherBackEndEnums[teacher];
          structure["primary"][teacher] = temp[pedLabels[0]];
          structure["secondary"][teacher] = temp[pedLabels[1]];
        }
      }
    }

    const result = [
      Object.values(structure["primary"]),
      Object.values(structure["secondary"]),
    ];

    // let orderActor = { RED: 1, GREEN: 2, BLUE: 3 };
    // result.sort((a, b) => orderActor[a.actor] - orderActor[b.actor]);

    console.log(result);
    return result;
  };
  useEffect(() => {
    async function callData() {
      try {
        const res = await getCompleteCoTeachData({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
        });
        if (res.status === 200) {
          const result = cleanRawData(res.data);
          setPrimaryData(result[0]);
          setSecondaryData(result[1]);
          setIsError(false);
        }
      } catch (error) {
        console.log(error);
        setIsError(true);
      }
    }
    callData();
  }, [simulationId, startTime, endTime]);

  const data = {
    labels,
    datasets: [
      {
        label: pedLabels[0],
        data: primaryData,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgb(129,15,124, 0.5)",
      },
      {
        label: pedLabels[1],
        data: secondaryData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(140,150,198, 0.5)",
      },
    ],
  };

  return (
    <div style={mainBoxStyles.container}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default SpatialPedagogyViz;
