import { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import { useTimeline } from "./TimelineContext";
import {
  BsFastForwardFill,
  BsRewindFill,
  BsSpeedometer2,
  BsPauseFill,
  BsPlayFill,
} from "react-icons/bs";
import { useObservation } from "../ObservationContext";

const calculateDuration = (startTime, endTime) => {
  return Math.round(Math.abs(new Date(endTime) - new Date(startTime)) / 1000);
};

// fake numbers for now
const simStartTimestamp = "2023-06-01T00:09:38.357Z";
const simEndTimestamp = "2023-06-01T00:25:44.896Z";
const simDuration = calculateDuration(simStartTimestamp, simEndTimestamp);

const eventOnePosition = 408; // Ruth entered
const eventTwoPosition = 606; // Secondary nurse entered

const timelineMarks = [
  {
    value: eventOnePosition,
  },
  {
    value: eventTwoPosition,
  },
];
const keyEventMarks = [
  {
    value: eventOnePosition,
    label: "KE1",
  },
  {
    value: eventTwoPosition,
    label: "KE2",
  },
];

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
  nurseTimelineSx: {
    "& .MuiSlider-thumb": {
      width: 3, // Thin width
      height: 35, // Height covering all track
      borderRadius: 0, // Make it rectangle
      backgroundColor: "#1976d2", // from MUI
    },
    "& .MuiSlider-mark": {
      backgroundColor: "#bfbfbf",
      height: 25,
    },
  },
  keyEventTimelineSx: {
    "& .MuiSlider-mark": {
      height: 15,
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

const CustomMark = ({ mark, index }) => {
  // Add your custom styling here
  return (
    <div style={{ position: "relative", paddingBottom: "-200px" }}>
      <span
        style={{
          position: "absolute",
          top: index % 2 === 0 ? "-20px" : "-70px", // example: alternating label positions
          transform: "rotate(-45deg)",
          marginLeft: "-5px",
        }}
      >
        {mark.label}
      </span>

      <span
        // example: alternating mark heights
        style={{
          display: "block",
          width: "2px",
          position: "absolute",
          bottom: 0,
          height: index % 2 === 0 ? "20px" : "70px",
          backgroundColor: "#1976d2",
          marginBottom: "-20px",
          marginLeft: "-1px",
        }}
      ></span>
    </div>
  );
};

// timeline duration displays formatting
const formatDuration = (value) => {
  const minute = Math.floor(value / 60);
  const secondLeft = value - minute * 60;
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
};

const TimelineVisualisation = () => {
  const { notes } = useObservation();

  const [intervalID, setInteralID] = useState(null);

  // timeline range and playhead
  const { range, setRange, playHeadPosition, setPlayHeadPosition } =
    useTimeline();
  // play or pause state
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (!isPlaying) {
      // Start playing
      const id = setInterval(() => {
        setPlayHeadPosition((current) => {
          // Stop increasing if at max value
          if (current >= range[1]) {
            clearInterval(id);
            return current;
          }
          return current + 1;
        });
      }, 1000);
      setInteralID(id);
    } else {
      clearInterval(intervalID);
    }
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  // clear interval when component unmounted
  useEffect(() => {
    return () => {
      clearInterval(intervalID);
    };
  }, [intervalID]);

  return (
    <>
      <Container
        style={{
          marginTop: "15px",
          marginBottom: "10px",
          paddingTop: "70px",
          position: "relative",
        }}
      >
        <Row>
          <Col>
            <Slider
              value={range}
              max={simDuration}
              onChange={(_, newValue) => {
                setRange(newValue);
                setPlayHeadPosition(newValue[0]);
              }}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              marks={keyEventMarks.map((mark, index) => ({
                ...mark,
                label: <CustomMark mark={mark} index={index} />,
              }))}
              sx={timelineStyle.keyEventTimelineSx}
            />

            <Slider
              value={playHeadPosition}
              max={simDuration}
              onChange={(_, newValue) => setPlayHeadPosition(newValue)}
              valueLabelDisplay="auto"
              aria-labelledby="playhead-slider"
              disabled
              //   style={{ color: "blue", height: "10px", marginTop: "-20px" }}
              sx={timelineStyle.keyEventTimelineSx}
            />

            <Slider
              aria-label="controller-timeline"
              value={playHeadPosition}
              max={simDuration}
              onChange={(_, value) => setPlayHeadPosition(value)}
              marks={keyEventMarks.map((mark, index) => ({
                ...mark,
                label: <CustomMark mark={mark} index={index} />,
              }))}
              sx={timelineStyle.keyEventTimelineSx}
            ></Slider>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "-30px",
              }}
            >
              <div style={timelineStyle.tinyDurationText}>
                {formatDuration(playHeadPosition)}
              </div>
              <div style={timelineStyle.tinyDurationText}>
                -{formatDuration(simDuration - playHeadPosition)}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <Container style={timelineStyle.playerContainer}>
        <Button
          style={{
            margin: "5px",
            backgroundColor: "transparent",
            border: "none",
          }}
          onClick={() => setPlayHeadPosition(playHeadPosition - 10)}
        >
          <BsRewindFill size={30} color="#bdbdbd" />
        </Button>
        <Button
          style={{
            margin: "5px",
            backgroundColor: "transparent",
            border: "none",
          }}
          onClick={() => {
            handlePlayPause();
          }}
        >
          {isPlaying ? (
            <BsPauseFill size={30} color="#bdbdbd" />
          ) : (
            <BsPlayFill size={30} color="#bdbdbd" />
          )}
        </Button>
        <Button
          style={{
            margin: "5px",
            backgroundColor: "transparent",
            border: "none",
          }}
          onClick={() => setPlayHeadPosition(playHeadPosition + 10)}
        >
          <BsFastForwardFill size={30} color="#bdbdbd" />
        </Button>
      </Container>
    </>
  );
};

export default TimelineVisualisation;
