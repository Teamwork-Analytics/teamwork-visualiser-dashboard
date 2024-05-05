import { COLOURS } from "../../../config/colours";
import DataStorytellingBox from "./DataStorytellingBox";
import MatrixVisualisation from "./MatrixVisualisation";
import SquareButton from "./SquareButton";

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
    <div style={styles.container}>
      <div style={styles.spatialPedagogyButttons}>
        <SquareButton icon={"ALL"} />
        <SquareButton icon={"A"} lable={"authoritative"} />
        <SquareButton icon={"S"} lable={"supervisory"} />
        <SquareButton icon={"I"} lable={"interactional"} />
        <SquareButton icon={"P"} lable={"personal"} />
      </div>
      <div style={styles.actorsAndDisplay}>
        <div style={styles.actors}>
          <SquareButton
            icon={"R"}
            lable={"Red TA"}
            colourHex={COLOURS.PERSON_1}
          />
          <SquareButton
            icon={"G"}
            lable={"Green TA"}
            colourHex={COLOURS.PERSON_3}
          />
          <SquareButton
            icon={"B"}
            lable={"Blue TA"}
            colourHex={COLOURS.PERSON_2}
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

export default CoTeachVizView;
