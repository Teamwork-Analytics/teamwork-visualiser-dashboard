/**
 * @file DisplayViz Component
 *
 * @description This component is responsible for rendering different types of visualisations based
 * on the provided selection. The visualisations can be of different sizes, which are determined
 * by the size of the selected visualisation array and the individual visualisation id.
 *
 * @props
 *  - selectedVis: Array of visualisation data to be displayed.
 *  - range: A range value to be passed to each visualisation component.
 */

import Card from "react-bootstrap/Card";

// Import visualisation components
import {
  SocialNetworkView,
  ENANetworkView,
} from "../../projects/communication";
import TeamworkBarchart from "../../projects/teamwork-prio/TeamworkBarchart";
import HiveView from "../../projects/hive/HiveView";
import VideoVisualisation from "../../projects/observation/visualisationComponents/VideoVisualisation";

// Define the styles for each visualisation size
const SIZE_STYLES = {
  general: { border: 0 },
  small: {
    width: "40%",
    minWidth: 300,
    height: "50%",
    minHeight: 300,
  },
  medium: {
    width: "50%",
    minWidth: 300,
    height: "50%",
    minHeight: 300,
  },
  large: { width: "100%", minWidth: 400, minHeight: 300 },
  single: { width: "100vw", height: "90%", margin: "auto" },
};

const DisplayViz = ({ selectedVis, range, optionalHiveState }) => {
  // Define the visualisation components and their sizes
  // TODO: consider using useMemo for viz

  // Determine the size based on the selected visualisations
  const decideSize = (d) => {
    if (selectedVis.length === 1 && d.id !== "videoVis") {
      return "single";
    }
    return imageReferences[d.id].size;
  };

  const imageReferences = {
    commBehaviour: {
      size: "small",
      viz: (
        <ENANetworkView
          timeRange={range}
          height={selectedVis.length === 1 ? "100vh" : "50vh"}
        />
      ),
    },
    commNetwork: {
      size: "small",
      viz: (
        <SocialNetworkView
          timeRange={range}
          height={selectedVis.length === 1 ? "100vh" : "50vh"}
        />
      ),
    },
    priorBar: {
      size: "small",
      viz: (
        <TeamworkBarchart
          width={"45vw"}
          timeRange={range}
          customAspectRatio={1.5}
          fluid
        />
      ),
    },
    wardMap: {
      size: "medium",
      viz: (
        <HiveView
          timeRange={range}
          showFilter={false}
          // height="50vh"
          hiveState={optionalHiveState}
        />
      ),
    },
    video: {
      size: "large",
      viz: (
        <VideoVisualisation
          style={{
            width: "auto",
            objectFit: "scale-down",
            maxHeight: "33vh",
            minHeight: "30vh",
          }}
          isVideoTabActive={true}
          fluid
          timeRange={range}
        />
      ),
    },
  };

  // Sort array so large items are always first
  const sortedVis = selectedVis.sort((a, b) => {
    if (
      imageReferences[a.id].size === "large" &&
      imageReferences[b.id].size !== "large"
    ) {
      return -1;
    } else if (
      imageReferences[b.id].size === "large" &&
      imageReferences[a.id].size !== "large"
    ) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
        height: "100%",
        width: "100%",
      }}
    >
      {sortedVis.length !== 0 ? (
        sortedVis.map((d) => (
          <div
            style={{
              ...SIZE_STYLES["general"],
              ...SIZE_STYLES[decideSize(d)],
            }}
          >
            {/* <Card.Body
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            > */}
            {imageReferences[d.id].viz}
            {/* </Card.Body> */}
          </div>
        ))
      ) : selectedVis.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <div align="center">
            <h4>🔍 Visualisations will be available here.</h4>
            <p>Please select up to 3 visualisations on a tablet.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DisplayViz;
