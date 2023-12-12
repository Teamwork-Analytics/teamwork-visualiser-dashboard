import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import { Slider } from "@mui/material";
import { Container, Row, Col } from "react-bootstrap";
import { useTimeline } from "./TimelineContext";
import { manualLabels } from "../index.js";
import { COLOURS } from "src/shared/constants/colours.js";

// styling
const timelineStyle = {
  nurseTimeline: {
    paddingTop: "5px",
    paddingBottom: "5px",
  },
  tinyDurationText: {
    fontSize: "0.75rem",
    opacity: 0.38,
    fontWeight: 500,
    letterSpacing: 0.2,
  },
  nurseBadge: {
    display: "block",
    marginTop: "3px",
    marginBottom: "3px",
  },
  keyEventTimelineSx: {
    "& .MuiSlider-mark": {
      backgroundColor: COLOURS.ACTION_ORANGE,
      height: 15,
      width: "1.5px",
      "&.MuiSlider-markActive": {
        opacity: 1,
        backgroundColor: COLOURS.ACTION_ORANGE,
      },
    },
    "& .MuiSlider-markLabel": {
      top: "-5px",
      fontSize: "0.5rem",
    },
    "& .MuiSlider-thumb": {
      width: 10,
      height: 10,
    },
  },
  playerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-5px",
    marginBottom: "15px",
  },
};

const CustomMark = ({ mark }) => {
  const markStyle = { fontWeight: "bold", fontSize: "1em" };

  return (
    <>
      {isKeyEvent(mark.label) ? (
        <div style={{ position: "relative", paddingBottom: "-200px" }}>
          <div
            style={{
              position: "absolute",
              top: "-10px",
              minWidth: "80px",
              maxWidth: "120px",
              transform: `translateX(-50%) translateY(-65%)`,
              ...markStyle,
            }}
          >
            <span>{formatDuration(mark.value)}</span>
            <br />
            <span style={{ whiteSpace: "normal" }}>{mark.label}</span>
          </div>
          <span
            style={{
              display: "block",
              width: "2px",
              position: "absolute",
              bottom: -8,
              height: "20px",
              backgroundColor: COLOURS.KEY_EVENT_PURPLE,
              marginBottom: "-20px",
              marginLeft: "-1px",
            }}
          ></span>
        </div>
      ) : null}
    </>
  );
};

const isKeyEvent = (label) =>
  manualLabels.phases.some((item) => item.label === label);

// timeline duration displays formatting
const formatDuration = (value) => {
  const minute = Math.floor(value / 60);
  const secondLeft = value - minute * 60;
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
};

// Component responsible for visualizing the video
const VideoVisualisation = ({ isVideoTabActive, timeRange }) => {
  // Get the data from the timeline context
  const { range, setRange, setPlayHeadPosition, simDuration, timelineTags } =
    useTimeline();

  // Extract the simulation ID from the URL parameters
  const { simulationId } = useParams();

  // Construct the URL for the video
  const videoUrl = `${process.env.REACT_APP_EXPRESS_IP}:${process.env.REACT_APP_EXPRESS_PORT}/data/${simulationId}/result/transcoded_output.mp4`;

  // The range in which the video should play
  const videoRange = timeRange;

  // The start and end time for video playback in seconds
  const startTime = videoRange[0];
  const endTime = videoRange[1];

  // Reference to the ReactPlayer component
  const playerRef = useRef(null);

  // State variables for keeping track of the video playback and initialization
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Function to handle video progress
  const handleProgress = ({ playedSeconds }) => {
    // Pause the video once the played seconds exceed the end time
    if (playedSeconds > endTime) {
      setIsPlaying(false);
    }
  };

  // Function to handle video readiness
  const handleReady = () => {
    // Only seek to start time on the first ready event ---- or will keep loading
    if (!hasStarted) {
      playerRef.current.seekTo(startTime, "seconds");
      setHasStarted(true); // Indicate that we have started the video
    }
  };

  // Effect to handle tab activity and video initialization
  useEffect(() => {
    setIsPlaying(isVideoTabActive);
  }, [isVideoTabActive]); // Add dependencies for effect

  // Effect hook to seek video
  useEffect(() => {
    playerRef.current.seekTo(startTime, "seconds");
  }, [startTime]);

  // keep value only for non key event tags
  const filterTimelineTagsForKeyEvent = (tags) => {
    return tags.map((tag) => {
      if (isKeyEvent(tag.label)) {
        return tag; // return the tag as is if it is a key event
      }
    });
  };

  const modifiedTimelineTags = filterTimelineTagsForKeyEvent(timelineTags);

  return (
    <>
      <Container
        style={{
          marginTop: "10px",
          marginBottom: "10px",
          position: "relative",
          maxWidth: "none",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <Row>
          <Col style={{ paddingLeft: "50px", paddingRight: "50px" }}>
            <Slider
              value={range}
              max={simDuration}
              onChange={(_, newValue) => {
                setRange(newValue);
                setPlayHeadPosition(newValue[0]);
              }}
              valueLabelDisplay="auto"
              // show tooltip in MM:SS format
              valueLabelFormat={(value) => {
                const minutes = Math.floor(value / 60);
                const seconds = value % 60;
                return `${minutes.toString().padStart(2, "0")}:${seconds
                  .toString()
                  .padStart(2, "0")}`;
              }}
              aria-labelledby="range-slider"
              marks={modifiedTimelineTags.map((mark, index) => ({
                ...mark,
                label: <CustomMark mark={mark} index={index} />,
              }))}
              sx={timelineStyle.keyEventTimelineSx}
              style={{ marginTop: "20px" }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "-30px",
              }}
            >
              <div style={timelineStyle.tinyDurationText}>
                {formatDuration(0)}
              </div>
              <div style={timelineStyle.tinyDurationText}>
                {formatDuration(simDuration)}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <div
        style={{
          position: "relative",
          paddingBottom: "30%",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={isPlaying}
          onProgress={handleProgress}
          onReady={handleReady}
          width="100%"
          height="150%"
          style={{ position: "absolute", top: "-25%", left: "0" }}
          playbackRate={1}
          controls={true}
          playsInline={true} // Needed for compatibility with iOS and iPadOS
        />
      </div>
    </>
  );
};

export default VideoVisualisation;
