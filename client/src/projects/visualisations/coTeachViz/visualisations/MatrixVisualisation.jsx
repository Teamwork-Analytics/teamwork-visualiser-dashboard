import { useEffect, useState } from "react";
import { COLOURS } from "../../../../config/colours";
import { mainBoxStyles } from "../styles";
import { useParams } from "react-router-dom";
import { getCoTeachMatrixdata } from "../../../../services/py-server";
import { useTimeline } from "../../../observation/visualisationComponents/TimelineContext";

const SquareBox = ({ object }) => {
  const actorColourMap = {
    RED: COLOURS.PERSON_1_RGB,
    BLUE: COLOURS.PERSON_2_RGB,
    GREEN: COLOURS.PERSON_3_RGB,
  };
  const colour = actorColourMap[object.actor];
  const opacity = object.percentage / 100;
  const bgColour = `rgba(${colour.r},${colour.g},${colour.b},${opacity})`;

  const styles = {
    square: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "5.5em",
      width: "5.5em",
      margin: "0.25em",
      background: bgColour,
    },
  };
  return (
    <div style={styles.square}>
      <h2>{object.percentage}</h2>%
    </div>
  );
};

const MatrixVisualisation = ({ data }) => {
  const { range } = useTimeline();
  const { simulationId } = useParams();

  const [matrixData, setMatrixData] = useState([
    { actor: "RED", spaceCode: "authoritative", percentage: 16 },
    { actor: "RED", spaceCode: "supervisory", percentage: 35 },
    { actor: "RED", spaceCode: "interactional", percentage: 42 },
    { actor: "RED", spaceCode: "personal", percentage: 7 },
    { actor: "GREEN", spaceCode: "authoritative", percentage: 73 },
    { actor: "GREEN", spaceCode: "supervisory", percentage: 8 },
    { actor: "GREEN", spaceCode: "interactional", percentage: 12 },
    { actor: "GREEN", spaceCode: "personal", percentage: 7 },
    { actor: "BLUE", spaceCode: "authoritative", percentage: 0 },
    { actor: "BLUE", spaceCode: "supervisory", percentage: 10 },
    { actor: "BLUE", spaceCode: "interactional", percentage: 51 },
    { actor: "BLUE", spaceCode: "personal", percentage: 39 },
  ]);
  const [isError, setIsError] = useState(matrixData.length === 0);

  const startTime = range[0];
  const endTime = range[1];

  const cleanRawData = (data) => {
    let result = [];

    for (let actor in data) {
      for (let spaceCode in data[actor]) {
        let percentage = data[actor][spaceCode];
        result.push({ actor, spaceCode, percentage });
      }
    }

    let order = { RED: 1, GREEN: 2, BLUE: 3 };
    result.sort((a, b) => order[a.actor] - order[b.actor]);

    return result;
  };

  useEffect(() => {
    async function callData() {
      try {
        const res = await getCoTeachMatrixdata({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
        });
        if (res.status === 200) {
          const result = cleanRawData(res.data);
          setMatrixData(result);
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

  return (
    <div style={mainBoxStyles.container}>
      {!isError ? (
        matrixData.map((d) => {
          return <SquareBox object={d} />;
        })
      ) : (
        <p>Please filter the time.</p>
      )}
    </div>
  );
};

export default MatrixVisualisation;
