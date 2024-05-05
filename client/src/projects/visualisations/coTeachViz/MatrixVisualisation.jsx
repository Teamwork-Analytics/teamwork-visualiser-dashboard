import { useState } from "react";
import { COLOURS } from "../../../config/colours";

const SquareBox = ({ object }) => {
  const actorColourMap = {
    red: COLOURS.PERSON_1_RGB,
    blue: COLOURS.PERSON_2_RGB,
    green: COLOURS.PERSON_3_RGB,
  };
  const colour = actorColourMap[object.actor];
  const opacity = object.percentage / 100;
  const bgColour = `rgba(${colour.r},${colour.g},${colour.b},${opacity})`;
  console.log(bgColour);

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
  const [matrixData, setMatrixData] = useState([
    { actor: "red", spaceCode: "authoritative", percentage: 16 },
    { actor: "red", spaceCode: "supervisory", percentage: 35 },
    { actor: "red", spaceCode: "interactional", percentage: 42 },
    { actor: "red", spaceCode: "personal", percentage: 7 },
    { actor: "green", spaceCode: "authoritative", percentage: 73 },
    { actor: "green", spaceCode: "supervisory", percentage: 8 },
    { actor: "green", spaceCode: "interactional", percentage: 12 },
    { actor: "green", spaceCode: "personal", percentage: 7 },
    { actor: "blue", spaceCode: "authoritative", percentage: 0 },
    { actor: "blue", spaceCode: "supervisory", percentage: 10 },
    { actor: "blue", spaceCode: "interactional", percentage: 51 },
    { actor: "blue", spaceCode: "personal", percentage: 39 },
  ]);

  const styles = {
    container: {
      height: "17.5em",
      width: "24em",
      display: "flex",
      flexWrap: "wrap",
    },
  };

  return (
    <div style={styles.container}>
      {matrixData.map((d) => {
        return <SquareBox object={d} />;
      })}
    </div>
  );
};

export default MatrixVisualisation;
