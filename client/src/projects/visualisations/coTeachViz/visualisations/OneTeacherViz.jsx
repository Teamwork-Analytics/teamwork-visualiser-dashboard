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
import { getCoTeachByTeacherData } from "../../../../services/py-server";
import { useEffect, useState } from "react";
import { useTimeline } from "../../../observation/visualisationComponents/TimelineContext";
import { useParams } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  // indexAxis: "y",
  maintainAspectRatio: false,
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
  // parsing: { xAxisKey: "id", yAxisKey: "value" },
};

const labels = ["Lecturing", "Observing", "Interacting", "Watching"];

const OneTeacherViz = ({ type }) => {
  const { range } = useTimeline();
  const { simulationId } = useParams();

  const [spatialPedagogyPrimaryData, setSpatialPedagogyPrimaryData] = useState(
    []
  );
  const [spatialPedagogySecondaryData, setSpatialPedagogySecondaryData] =
    useState([]);

  const [isError, setIsError] = useState(
    spatialPedagogyPrimaryData.length === 0
  );

  const startTime = range[0];
  const endTime = range[1];

  const cleanRawData = (data) => {
    const structure = {
      primary: {
        lecturing: 0,
        monitoring: 0,
        "1-1 student teacher interaction": 0,
        personal: 0,
      },
      secondary: {
        assisting: 0,
        surveillance: 0,
        "teacher-teacher interaction": 0,
        watching: 0,
      },
    };

    for (let pedagogy in data) {
      for (let activity in data[pedagogy]) {
        let percentage = data[pedagogy][activity];
        if (activity in structure["primary"])
          structure["primary"][activity] = percentage;
        if (activity in structure["secondary"])
          structure["secondary"][activity] = percentage;
      }
    }

    const result = [
      Object.values(structure["primary"]),
      Object.values(structure["secondary"]),
    ];
    return result;
  };

  useEffect(() => {
    async function callData() {
      try {
        const res = await getCoTeachByTeacherData({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
          taColour: type,
        });
        if (res.status === 200) {
          const result = cleanRawData(res.data);
          setSpatialPedagogyPrimaryData(result[0]);
          setSpatialPedagogySecondaryData(result[1]);
          setIsError(false);
          console.log(result);
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
        label: "Primary",
        data: spatialPedagogyPrimaryData,
        borderColor: "rgb(129,15,124)",
        backgroundColor: "rgb(129,15,124, 0.5)",
      },
      {
        label: "Secondary",
        data: spatialPedagogySecondaryData,
        borderColor: "rgb(140,150,198)",
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

export default OneTeacherViz;
