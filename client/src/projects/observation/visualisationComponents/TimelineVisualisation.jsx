import { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useTimeline } from "./TimelineContext";
import { BsCircleFill, BsCircle } from "react-icons/bs";
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

const CustomMark = ({ mark }) => {
  const markStyle = isKeyEvent(mark.label)
    ? { fontWeight: "bold", fontSize: "1.3em" }
    : {};

  const markHeight = isKeyEvent(mark.label) ? "50px" : "10px";
  const markTop = isKeyEvent(mark.label) ? "-50px" : "-10px";

  return (
    <>
      {isKeyEvent(mark.label) ? (
        <div style={{ position: "relative", paddingBottom: "-200px" }}>
          <span
            style={{
              position: "absolute",
              top: markTop, // top position based on whether it's a key event
              marginLeft: "-30px",
              maxWidth: "40px",
              wordWrap: "break-word", // enable word wrapping
              overflowWrap: "break-word", // break long strings of text
              ...markStyle,
            }}
          >
            {mark.label}
          </span>
          <span
            // mark heights depend on whether it's a key event
            style={{
              display: "block",
              width: "2px",
              position: "absolute",
              bottom: 0,
              height: markHeight,
              backgroundColor: "#1976d2",
              marginBottom: "-20px",
              marginLeft: "-1px",
            }}
          ></span>
        </div>
      ) : null}
    </>
  );
};

// timeline duration displays formatting
const formatDuration = (value) => {
  const minute = Math.floor(value / 60);
  const secondLeft = value - minute * 60;
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
};

// convert to seconds from duration
const reverseFormatDuration = (formattedDuration) => {
  const [minutes, seconds] = formattedDuration.split(":").map(Number);
  return minutes * 60 + seconds;
};

const FilteredMarksComponent = ({ marks, range, setRange }) => {
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
    <Card
      style={{
        height: "30vh",
        overflowY: "scroll",
        fontSize: "12px",
        marginTop: "-30px",
      }}
    >
      <Card.Body>
        {formattedMarks.map((mark, index) => (
          <Row
            style={{ marginLeft: "0px", marginRight: "0px" }}
            key={index}
            onClick={() => {
              setRange([
                reverseFormatDuration(mark.value) - 10,
                reverseFormatDuration(mark.value) + 10,
              ]);
            }}
          >
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
              {mark.value} - {mark.label}
            </Col>
          </Row>
        ))}
      </Card.Body>
    </Card>
  );
};

const TimelineVisualisation = () => {
  // timeline range and playhead
  const { range, setRange, setPlayHeadPosition, simDuration, timelineTags } =
    useTimeline();

  // keep value only for non key event tags
  const filterTimelineTagsForKeyEvent = (tags) => {
    return tags.map((tag) => {
      if (isKeyEvent(tag.label)) {
        return tag; // return the tag as is if it is a key event
      } else {
        return { value: tag.value }; // return the tag without the label if it is not a key event
      }
    });
  };
  const modifiedTimelineTags = filterTimelineTagsForKeyEvent(timelineTags);

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
              marks={modifiedTimelineTags.map((mark, index) => ({
                ...mark,
                label: <CustomMark mark={mark} index={index} />,
              }))}
              sx={timelineStyle.keyEventTimelineSx}
              style={{ marginTop: "120px" }}
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
          <Col xs={3} style={{ paddingLeft: "5px", paddingRight: "5px" }}>
            <FilteredMarksComponent
              marks={timelineTags}
              range={range}
              setRange={setRange}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TimelineVisualisation;
