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
  general: { border: 0, backgroundColor: "white" },
  small: {
    width: "40%",
    minWidth: 300,
    height: "50%",
    minHeight: 300,
  },
  medium: {
    width: "55%",
    minWidth: 300,
    height: "50%",
    minHeight: 300,
  },
  large: { width: "100%", minWidth: 400, minHeight: 300 },
  single: { width: "100%", height: "90%", margin: "auto" },
};

const DisplayViz = ({ selectedVis, range }) => {
  // Define the visualisation components and their sizes
  // TODO: consider using useMemo for viz
  const imageReferences = {
    commBehaviour: {
      size: "small",
      viz: <ENANetworkView timeRange={range} height={"50vh"} />,
    },
    commNetwork: {
      size: "small",
      viz: <SocialNetworkView timeRange={range} height={"50vh"} />,
    },
    priorBar: {
      size: "small",
      viz: (
        <TeamworkBarchart height={""} width={"55vw"} timeRange={range} fluid />
      ),
    },
    wardMap: {
      size: "medium",
      viz: <HiveView timeRange={range} showFilter={false} height="50vh" />,
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

  // Determine the size based on the selected visualisations
  const decideSize = (d) => {
    if (selectedVis.length === 1 && d.id !== "videoVis") {
      return "single";
    }
    return imageReferences[d.id].size;
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
          <Card
            style={{ ...SIZE_STYLES["general"], ...SIZE_STYLES[decideSize(d)] }}
          >
            <Card.Body
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {imageReferences[d.id].viz}
            </Card.Body>
          </Card>
        ))
      ) : (
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
            <h1>🔍No visualisations</h1>
            <p>Please select up to three visualisations</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayViz;