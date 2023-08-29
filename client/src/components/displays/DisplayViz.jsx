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

// Import visualisation components
import {
  SocialNetworkView,
  ENANetworkView,
} from "../../projects/communication";
import TeamworkBarchart from "../../projects/teamwork-prio/TeamworkBarchart";
import HiveView from "../../projects/hive/HiveView";
import VideoVisualisation from "../../projects/observation/visualisationComponents/VideoVisualisation";
import { Slider } from "@mui/material";
import { COLOURS } from "../../config/colours";

// Define the styles for each visualisation size
const SIZE_STYLES = {
  general: { border: 0 },
  small: {
    width: "40%",
    minWidth: "38vw",
    height: "35%",
    minHeight: "38vh",
  },
  medium: {
    width: "40%",
    minWidth: "38vw",
    height: "35%",
    minHeight: "38vh",
  },
  large: { width: "100%", minWidth: 400, minHeight: 300 },
  single: { width: "90vw", height: "70vh", margin: "auto" },
};

const formatDuration = (value) => {
  const minute = Math.floor(value / 60);
  const secondLeft = value - minute * 60;
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
};

const DisplayViz = ({
  selectedVis,
  range,
  optionalHiveState,
  simDuration,
  timelineTags,
}) => {
  // Define the visualisation components and their sizes
  // TODO: consider using useMemo for viz

  const keyEvents = [...timelineTags.filter((item) => item.label)].reverse();

  const phases = [
    ...keyEvents.map((event, index, self) => ({
      name: event.label,
      start: event.value,
      end: self[index + 1]?.value || simDuration,
    })),
  ];

  const getPhaseName = (phases, range) => {
    const phase = phases.find((p) => range[0] >= p.start && range[1] <= p.end);
    return phase
      ? phase.name
      : `${formatDuration(range[0])} to ${formatDuration(range[1])}`;
  };

  const phaseName = getPhaseName(phases, range);

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
          height={selectedVis.length === 1 ? "60vh" : "38vh"}
        />
      ),
    },
    commNetwork: {
      size: "small",
      viz: (
        <SocialNetworkView
          timeRange={range}
          height={selectedVis.length === 1 ? "60vh" : "38vh"}
        />
      ),
    },
    priorBar: {
      size: "small",
      viz: (
        <TeamworkBarchart
          width={"39vw"}
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
          height="39vh"
          // width="100%"
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
        position: "relative",
        paddingTop: "8vh",
      }}
    >
      {sortedVis.length !== 0 ? (
        <div
          style={{
            position: "absolute",
            zIndex: 100,
            top: 0,
            left: "50vw",
            transform: "translateX(-50%)",
            width: "50vw",
          }}
        >
          <Slider
            value={range}
            max={simDuration}
            disabled
            valueLabelDisplay="auto"
            // show tooltip in MM:SS format
            valueLabelFormat={(value) => {
              return formatDuration(value);
            }}
            aria-labelledby="projector-timeline"
            sx={{
              "& .MuiSlider-mark": {
                backgroundColor: COLOURS.KEY_EVENT_PURPLE,
                height: 15,
                width: "1.5px",
                "&.MuiSlider-markActive": {
                  opacity: 1,
                  backgroundColor: COLOURS.KEY_EVENT_PURPLE,
                },
              },
              "& .MuiSlider-markLabel": {
                top: "-5px",
                fontSize: "0.4rem",
              },
              "& .MuiSlider-thumb": {
                width: 10,
                height: 10,
              },
              "& .MuiSlider-valueLabel": {
                "& span": {
                  padding: "0px !important",
                  fontSize: "0.6rem !important",
                },
              },
            }}
            marks={timelineTags}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "-30px",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.38,
                fontWeight: 500,
                letterSpacing: 0.2,
              }}
            >
              {formatDuration(0)}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.38,
                fontWeight: 500,
                letterSpacing: 0.2,
              }}
            >
              {formatDuration(simDuration)}
            </div>
          </div>
          <p style={{ fontSize: "12px", marginTop: "-15px" }}>
            Activities happen during <strong>{phaseName}</strong>.
          </p>
        </div>
      ) : null}

      {sortedVis.length !== 0 ? (
        sortedVis.map((d) => (
          <div
            style={{
              ...SIZE_STYLES["general"],
              ...SIZE_STYLES[decideSize(d)],
            }}
          >
            {imageReferences[d.id].viz}
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
