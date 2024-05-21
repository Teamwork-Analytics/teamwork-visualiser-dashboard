import { useState } from "react";
import { COLOURS } from "../../../config/colours";
import DataStorytellingBox from "./DataStorytellingBox";
import MatrixVisualisation from "./visualisations/MatrixVisualisation";
import SquareButton from "./SquareButton";
import { green } from "@mui/material/colors";
import { CoTeachVizProvider, useCoTeachViz } from "./CoTeachVizContext";
import OneTeacherViz from "./visualisations/OneTeacherViz";
import SpatialPedagogyViz from "./visualisations/SpatialPedagogyViz";
import { SpatialPedEnums, TeacherEnums } from "./enums";

const CoTeachViz = () => {
  const { coTeachVizState } = useCoTeachViz();
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
        <SquareButton id={"all"} icon={"ALL"} />
        <SquareButton icon={"A"} id={"authoritative"} lable={"Authoritative"} />
        <SquareButton icon={"S"} id={"supervisory"} lable={"Supervisory"} />
        <SquareButton id={"interactional"} icon={"I"} lable={"Interactional"} />
        <SquareButton id={"personal"} icon={"P"} lable={"Personal"} />
      </div>
      <div style={styles.actorsAndDisplay}>
        <div style={styles.actors}>
          <SquareButton
            id={"RED"}
            icon={"R"}
            lable={"Red TA"}
            colourHex={COLOURS.PERSON_1}
            // onClick={changeColour}
          />
          <SquareButton
            id={"GREEN"}
            icon={"G"}
            lable={"Green TA"}
            colourHex={COLOURS.PERSON_3}
          />
          <SquareButton
            id={"BLUE"}
            icon={"B"}
            lable={"Blue TA"}
            colourHex={COLOURS.PERSON_2}
          />
        </div>
        {/* All visualisations set -- rendered one at a time */}
        {coTeachVizState.all && <MatrixVisualisation />}
        {coTeachVizState.RED && <OneTeacherViz type={TeacherEnums.RED} />}
        {coTeachVizState.GREEN && <OneTeacherViz type={TeacherEnums.GREEN} />}
        {coTeachVizState.BLUE && <OneTeacherViz type={TeacherEnums.BLUE} />}
        {coTeachVizState.authoritative && (
          <SpatialPedagogyViz type={SpatialPedEnums.AUTHORITATIVE} />
        )}
        {coTeachVizState.supervisory && (
          <SpatialPedagogyViz type={SpatialPedEnums.SUPERVISORY} />
        )}
        {coTeachVizState.interactional && (
          <SpatialPedagogyViz type={SpatialPedEnums.INTERACTIONAL} />
        )}
        {coTeachVizState.personal && (
          <SpatialPedagogyViz type={SpatialPedEnums.PERSONAL} />
        )}
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

  return (
    <div style={styles.container}>
      <CoTeachVizProvider>
        <CoTeachViz />
      </CoTeachVizProvider>
    </div>
  );
};

export default CoTeachVizView;
