import { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useTimeline } from "./TimelineContext";
import {
  BsFastForwardFill,
  BsRewindFill,
  BsSpeedometer2,
  BsPauseFill,
  BsPlayFill,
  BsCircleFill,
  BsCircle,
} from "react-icons/bs";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { manualLabels } from "../index.js";

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

const isKeyEvent = (label) =>
  manualLabels.phases.some((item) => item.label === label);

const CustomMark = ({ mark, index }) => {
  const markStyle = isKeyEvent(mark.label)
    ? { fontWeight: "bold", fontSize: "1.3em" }
    : {};

  return (
    <div style={{ position: "relative", paddingBottom: "-200px" }}>
      <span
        style={{
          position: "absolute",
          top: index % 2 === 0 ? "-20px" : "-70px", // alternating label positions
          transform: "rotate(-45deg)",
          marginLeft: "-20px",
          maxWidth: "40px",
          wordWrap: "break-word", // enable word wrapping // not working
          overflowWrap: "break-word", // break long strings of text // not working
          ...markStyle,
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

const FilteredMarksComponent = ({ marks, range }) => {
  // Filter marks within the range
  const filteredMarks = marks.filter((mark) => {
    return mark.value >= range[0] && mark.value <= range[1];
  });

  // Sort the filtered marks
  filteredMarks.sort((a, b) => a.value - b.value);

  // Convert value to MM:SS format
  const formattedMarks = filteredMarks.map((mark) => {
    return { ...mark, value: formatDuration(mark.value) };
  });

  // Render the formatted marks
  return (
    <Card style={{ height: "30vh", overflowY: "scroll", fontSize: "12px" }}>
      <Card.Body>
        {formattedMarks.map((mark, index) => (
          <Row style={{ marginLeft: "0px", marginRight: "0px" }} key={index}>
            <Col
              xs="auto"
              style={{
                margin: "auto",
                paddingLeft: "5px",
                paddingRight: "5px",
              }}
            >
              {isKeyEvent(mark.label) ? (
                <BsCircleFill size="0.5em" color="#9c27b0" />
              ) : (
                <BsCircle size="0.5em" color="#ed6c02" />
              )}
            </Col>
            <Col
              style={{
                margin: "auto",
                paddingLeft: "5px",
                paddingRight: "5px",
                textAlign: "left",
              }}
            >
              {mark.label} - {mark.value}
            </Col>
          </Row>
        ))}
      </Card.Body>
    </Card>
  );
};

const TimelineVisualisation = () => {
  // timeline range and playhead
  const {
    range,
    setRange,
    playHeadPosition,
    setPlayHeadPosition,
    simDuration,
    timelineTags,
  } = useTimeline();
  // play or pause state
  const [isPlaying, setIsPlaying] = useState(false);

  const [intervalID, setInteralID] = useState(null);

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
          position: "relative",
          maxWidth: "none",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <Row>
          <Col style={{ paddingLeft: "5px", paddingRight: "5px" }}>
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
              marks={timelineTags.map((mark, index) => ({
                ...mark,
                label: <CustomMark mark={mark} index={index} />,
              }))}
              sx={timelineStyle.keyEventTimelineSx}
              style={{ marginTop: "150px" }}
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

            {/* <Slider
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
              marks={timelineTags.map((mark, index) => ({
                ...mark,
                label: <CustomMark mark={mark} index={index} />,
              }))}
              sx={timelineStyle.keyEventTimelineSx}
            ></Slider> */}
            {/* <div
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
            </div> */}
          </Col>
          <Col xs={3} style={{ paddingLeft: "5px", paddingRight: "5px" }}>
            <FilteredMarksComponent marks={timelineTags} range={range} />
          </Col>
        </Row>
      </Container>
      {/* <Container style={timelineStyle.playerContainer}>
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
      </Container> */}
    </>
  );
};

export default TimelineVisualisation;