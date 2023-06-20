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

// fake numbers for now
const totalDuration = 1800; // 30 mins to seconds
const eventOnePosition = 408; // Ruth entered
const eventTwoPosition = 606; // Secondary nurse entered
const eventThreePosition = 1365; // MET call
const eventFourPosition = 1408; // Doctor entered
const timelineMarks = [
  {
    value: eventOnePosition,
  },
  {
    value: eventTwoPosition,
  },
  {
    value: eventThreePosition,
  },
  {
    value: eventFourPosition,
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
  {
    value: eventThreePosition,
    label: "KE3",
  },
  {
    value: eventFourPosition,
    label: "KE4",
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
    marginTop: "-1px",
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
  const { currentPosition, setCurrentPosition } = useTimeline();
  // play or pause button
  const [paused, setPaused] = useState(true);
  const [intervalId, setIntervalId] = useState(null);

  const handlePlayPause = () => {
    if (paused) {
      // Start playing
      const id = setInterval(() => {
        setCurrentPosition((current) => {
          // Stop increasing if at max value
          if (current >= totalDuration) {
            clearInterval(id);
            return current;
          }

          return current + 1;
        });
      }, 1000); // Execute every 1 second
      setIntervalId(id);
    } else {
      // Pause playing
      clearInterval(intervalId);
    }
    setPaused(!paused);
  };

  // clear interval when the component is unmounted
  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <>
      <Container style={{ marginTop: "15px", marginBottom: "15px" }}>
        <Row>
          <Col>
            <Container style={timelineStyle.playerContainer}>
              <Button
                style={{
                  margin: "5px",
                  backgroundColor: "transparent",
                  border: "none",
                }}
                onClick={() => setCurrentPosition(currentPosition - 10)}
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
                {paused ? (
                  <BsPlayFill size={30} color="#bdbdbd" />
                ) : (
                  <BsPauseFill size={30} color="#bdbdbd" />
                )}
              </Button>
              <Button
                style={{
                  margin: "5px",
                  backgroundColor: "transparent",
                  border: "none",
                }}
                onClick={() => setCurrentPosition(currentPosition + 10)}
              >
                <BsFastForwardFill size={30} color="#bdbdbd" />
              </Button>
            </Container>

            <Slider
              aria-label="controller-timeline"
              value={currentPosition}
              max={totalDuration}
              onChange={(_, value) => setCurrentPosition(value)}
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
                {formatDuration(currentPosition)}
              </div>
              <div style={timelineStyle.tinyDurationText}>
                -{formatDuration(totalDuration - currentPosition)}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TimelineVisualisation;
