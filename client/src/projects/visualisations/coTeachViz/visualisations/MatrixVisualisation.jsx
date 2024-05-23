import { useEffect, useState } from "react";
import { COLOURS } from "../../../../config/colours";
import { mainBoxStyles } from "../styles";
import { useParams } from "react-router-dom";
import { getCoTeachMatrixData } from "../../../../services/py-server";
import { useTimeline } from "../../../observation/visualisationComponents/TimelineContext";
import { Spinner } from "react-bootstrap";

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

const MatrixVisualisation = () => {
  const { range } = useTimeline();
  const { simulationId } = useParams();

  const [matrixData, setMatrixData] = useState([]);
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

    let orderSpace = {
      authoritative: 1,
      supervisory: 2,
      interactional: 3,
      personal: 4,
    };
    result.sort((a, b) => orderSpace[a.spaceCode] - orderSpace[b.spaceCode]);
    let orderActor = { RED: 1, GREEN: 2, BLUE: 3 };
    result.sort((a, b) => orderActor[a.actor] - orderActor[b.actor]);

    return result;
  };

  useEffect(() => {
    async function callData() {
      try {
        const res = await getCoTeachMatrixData({
          simulationId: simulationId,
          startTime: startTime,
          endTime: endTime,
        });
        if (res.status === 200) {
          const result = cleanRawData(res.data);
          setMatrixData(result);
          setIsError(false);
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
        <div style={mainBoxStyles.loading}>
          <Spinner fontSize={"large"} />
        </div>
      )}
    </div>
  );
};

export default MatrixVisualisation;
