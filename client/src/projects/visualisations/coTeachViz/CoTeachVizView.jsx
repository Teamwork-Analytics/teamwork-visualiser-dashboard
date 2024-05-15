import { useState } from "react";
import { COLOURS } from "../../../config/colours";
import { useHive } from "../hive/HiveContext";
import DataStorytellingBox from "./DataStorytellingBox";
import MatrixVisualisation from "./MatrixVisualisation";
import SquareButton from "./SquareButton";
import { green } from "@mui/material/colors";
import { CoTeachVizProvider, useCoTeachViz } from "./CoTeachVizContext";

const CoTeachViz = () => {
  const { changeColour } = useCoTeachViz();
  const styles = {
    spatialPedagogyButttons: {
      display: " flex",
      flexDirection: "row",
    },
    actorsAndDisplay: {
      display: " flex",
      flexDirection: "row",
    },
    actors: {
      display: " flex",
      flexDirection: "column",
    },
  };

  return (
    <div>
      <div style={styles.spatialPedagogyButttons}>
        <SquareButton
          id="all"
          icon={"ALL"}
          handleClick={() => changeColour("all")}
        />
        <SquareButton
          icon={"A"}
          id={"authoritative"}
          lable={"authoritative"}
          handleClick={() => changeColour("authoritative")}
        />
        <SquareButton
          icon={"S"}
          id={"supervisory"}
          lable={"supervisory"}
          handleClick={() => changeColour("supervisory")}
        />
        <SquareButton
          id={"interactional"}
          icon={"I"}
          lable={"interactional"}
          handleClick={() => changeColour("interactional")}
        />
        <SquareButton
          id={"personal"}
          icon={"P"}
          lable={"personal"}
          handleClick={() => changeColour("personal")}
        />
      </div>
      <div style={styles.actorsAndDisplay}>
        <div style={styles.actors}>
          <SquareButton
            id={"red"}
            icon={"R"}
            lable={"Red TA"}
            colourHex={COLOURS.PERSON_1}
            // onClick={changeColour}
            handleClick={() => changeColour("red")}
          />
          <SquareButton
            id={"green"}
            icon={"G"}
            lable={"Green TA"}
            colourHex={COLOURS.PERSON_3}
            handleClick={() => changeColour("green")}
          />
          <SquareButton
            id={"blue"}
            icon={"B"}
            lable={"Blue TA"}
            colourHex={COLOURS.PERSON_2}
            handleClick={() => changeColour("blue")}
          />
        </div>
        <MatrixVisualisation />
      </div>
      <div>
        <DataStorytellingBox />
      </div>
    </div>
  );
};

const CoTeachVizView = () => {
  const styles = {
    container: {
      height: "60vh",
      width: "45vw",
      margin: "1em",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  const { hiveState, hiveSetState } = useHive();

  return (
    <div style={styles.container}>
      <CoTeachVizProvider>
        <CoTeachViz />
      </CoTeachVizProvider>
    </div>
  );
};

export default CoTeachVizView;
