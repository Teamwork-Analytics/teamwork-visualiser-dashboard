import { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import { useTimeline } from "./TimelineContext";
import { FaUndoAlt, FaRedoAlt, FaPlay, FaPause } from "react-icons/fa";

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
  },
  playerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-1px",
  },
};

// skip or rewind 5 seconds button
const SkipIcon = () => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <FaRedoAlt size={30} color="#bdbdbd" />
      <span
        style={{
          position: "absolute",
          top: "20%",
          left: "40%",
          fontSize: "12px",
          color: "#bdbdbd",
        }}
      >
        5
      </span>
    </div>
  );
};

const RewindIcon = () => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <FaUndoAlt size={30} color="#bdbdbd" />
      <span
        style={{
          position: "absolute",
          top: "20%",
          left: "40%",
          fontSize: "12px",
          color: "#bdbdbd",
        }}
      >
        5
      </span>
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
          <Col xs="auto">
            <Badge bg="info" style={{ ...timelineStyle.nurseBadge }}>
              GN1
            </Badge>
            <Badge bg="danger" style={{ ...timelineStyle.nurseBadge }}>
              GN2
            </Badge>
            <Badge bg="success" style={{ ...timelineStyle.nurseBadge }}>
              WN1
            </Badge>
            <Badge bg="warning" style={{ ...timelineStyle.nurseBadge }}>
              WN2
            </Badge>
          </Col>

          <Col>
            <Slider
              aria-label="graduate-nurse-1-timeline"
              size="small"
              track={false}
              disabled
              value={currentPosition}
              max={totalDuration}
              style={timelineStyle.nurseTimeline}
              sx={timelineStyle.nurseTimelineSx}
              marks={timelineMarks}
            ></Slider>
            <Slider
              aria-label="graduate-nurse-2-timeline"
              size="small"
              track={false}
              disabled
              value={currentPosition}
              max={totalDuration}
              style={timelineStyle.nurseTimeline}
              sx={timelineStyle.nurseTimelineSx}
              marks={timelineMarks}
            ></Slider>
            <Slider
              aria-label="ward-nurse-1-timeline"
              size="small"
              track={false}
              disabled
              value={currentPosition}
              max={totalDuration}
              style={timelineStyle.nurseTimeline}
              sx={timelineStyle.nurseTimelineSx}
              marks={timelineMarks}
            ></Slider>
            <Slider
              aria-label="ward-nurse-1-timeline"
              size="small"
              track={false}
              disabled
              value={currentPosition}
              max={totalDuration}
              style={timelineStyle.nurseTimeline}
              sx={timelineStyle.nurseTimelineSx}
              marks={timelineMarks}
            ></Slider>

            <Container style={timelineStyle.playerContainer}>
              <Button
                style={{
                  margin: "5px",
                  backgroundColor: "transparent",
                  border: "none",
                }}
                onClick={() => setCurrentPosition(currentPosition - 5)}
              >
                <RewindIcon />
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
                  <FaPlay size={30} color="#bdbdbd" />
                ) : (
                  <FaPause size={30} color="#bdbdbd" />
                )}
              </Button>
              <Button
                style={{
                  margin: "5px",
                  backgroundColor: "transparent",
                  border: "none",
                }}
                onClick={() => setCurrentPosition(currentPosition + 5)}
              >
                <SkipIcon />
              </Button>
            </Container>

            <Slider
              aria-label="controller-timeline"
              value={currentPosition}
              max={totalDuration}
              onChange={(_, value) => setCurrentPosition(value)}
              marks={keyEventMarks}
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
