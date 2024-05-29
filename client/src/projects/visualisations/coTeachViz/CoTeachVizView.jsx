import { useState } from "react";
import { COLOURS } from "../../../config/colours";
import DataStorytellingBox from "./DataStorytellingBox";
import MatrixVisualisation from "./visualisations/MatrixVisualisation";
import SquareButton from "./SquareButton";
import { CoTeachVizProvider, useCoTeachViz } from "./CoTeachVizContext";
import OneTeacherViz from "./visualisations/OneTeacherViz";
import SpatialPedagogyViz from "./visualisations/SpatialPedagogyViz";
import { SpatialPedEnums, TeacherEnums, CoTeachButtonsToolTips } from "./enums";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import { HexagonFill } from "react-bootstrap-icons";
import { Tooltip } from "react-tooltip";
import "./index.css";

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
        <SquareButton
          icon={<RecordVoiceOverIcon fontSize="large" />}
          id={"authoritative"}
          lable={"Lecturing"}
        />
        <SquareButton
          icon={<VisibilityIcon fontSize="large" />}
          id={"supervisory"}
          lable={"Observing"}
        />
        <SquareButton
          id="interactional"
          icon={<Diversity3Icon fontSize="large" />}
          lable={"Interacting"}
        />
        <SquareButton
          id="personal"
          icon={<PersonIcon fontSize="large" />}
          lable={"Personal"}
        />
      </div>
      <div style={styles.actorsAndDisplay}>
        <div style={styles.actors}>
          <SquareButton
            id={"RED"}
            icon={<HexagonFill color={COLOURS.PERSON_1} />}
            lable={"Red TA"}
            // colourHex={COLOURS.PERSON_1}
            // onClick={changeColour}
          />
          <SquareButton
            id={"GREEN"}
            icon={<HexagonFill color={COLOURS.PERSON_3} />}
            lable={"Green TA"}
            // colourHex={COLOURS.PERSON_3}
          />
          <SquareButton
            id={"BLUE"}
            icon={<HexagonFill color={COLOURS.PERSON_2} />}
            lable={"Blue TA"}
            // colourHex={COLOURS.PERSON_2}
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
      // width: "20vw",
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
        <div>
          {Object.keys(CoTeachButtonsToolTips).map((e) => {
            return (
              <Tooltip id={e} className="tooltip">
                {CoTeachButtonsToolTips[e]}
              </Tooltip>
            );
          })}
        </div>
      </CoTeachVizProvider>
    </div>
  );
};

export default CoTeachVizView;
