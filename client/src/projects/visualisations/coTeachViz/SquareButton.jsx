import { useState } from "react";
import "./button.css";
import { useCoTeachViz } from "./CoTeachVizContext";

const DEFAULT_ACTIVE_COLOUR = "#303030";
const DEFAULT_COLOUR = "lightGrey";
const DEFAULT_FONT_COLOUR = "#0a0a0a";

const SquareButton = ({
  id,
  icon,
  lable,
  colourHex = DEFAULT_ACTIVE_COLOUR,
  children,
}) => {
  const { coTeachVizState, changeColour } = useCoTeachViz();
  // const [isActive, setIsActive] = useState();
  // const [colourState, setColourState] = useState(DEFAULT_COLOUR);
  // const [fontColour, setFontColour] = useState(DEFAULT_FONT_COLOUR);

  const styles = {
    container: {
      width: "5.5em",
      height: "5.5em",
      borderRadius: "20px",
      backgroundColor: coTeachVizState[id] ? colourHex : DEFAULT_COLOUR,
      color: coTeachVizState[id] ? "white" : DEFAULT_FONT_COLOUR,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0.25em",
    },
  };

  // const changeColour = () => {
  //   setIsActive(!isActive);
  //   setColourState(isActive ? DEFAULT_COLOUR : colourHex);
  //   setFontColour(isActive ? DEFAULT_FONT_COLOUR : "white");
  // };

  return (
    <div
      className={"squareBox"}
      style={styles.container}
      onClick={() => changeColour(id)}
    >
      <div>
        <h2>
          <b>{icon}</b>
        </h2>
        {lable !== null ? <small>{lable}</small> : null}
      </div>
    </div>
  );
};

export default SquareButton;
