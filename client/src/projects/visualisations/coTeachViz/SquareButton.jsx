import { useState } from "react";
import "./button.css";
import { useCoTeachViz } from "./CoTeachVizContext";
import { useHive } from "../hive/HiveContext";

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
  const { hiveState, hiveSetState } = useHive();
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

  const filterHiveViz = () => {
    const selectedLabels = ["RED", "GREEN", "BLUE"];

    if (selectedLabels.includes(id)) {
      let modifiedParticipants = {
        ...hiveState.participants,
        ...Object.fromEntries(
          Object.keys(hiveState.participants).map((key) => [key, false])
        ),
      };
      modifiedParticipants[id] = true;
      hiveSetState({
        ...hiveState,
        participants: modifiedParticipants,
      });
    }

    if (!selectedLabels.includes(id)) {
      let modifiedParticipants = {
        ...hiveState.participants,
        ...Object.fromEntries(
          Object.keys(hiveState.participants).map((key) => [key, true])
        ),
      };
      hiveSetState({
        ...hiveState,
        participants: modifiedParticipants,
      });
    }

    // taggingSocket.emit("send-nurse-filter", {
    //   ...hiveState,
    //   participants: modifiedParticipants,
    // });
  };

  return (
    <div
      data-tooltip-id={id}
      className={"squareBox"}
      style={styles.container}
      onClick={() => {
        changeColour(id);
        filterHiveViz();
      }}
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
