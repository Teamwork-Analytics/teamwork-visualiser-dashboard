import { Slider } from "@mui/material";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ButtonGroup,
} from "react-bootstrap";
import { useTimeline } from "./TimelineContext";
import {
  BsCircleFill,
  BsCircle,
  BsArrowClockwise,
  BsArrowCounterclockwise,
  BsStarFill,
} from "react-icons/bs";
import { COLOURS } from "../../../config/colours.js";
import { useTracking } from "react-tracking";

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

const isKeyEvent = (label) => true;
// manualLabels.phases.some((item) => item.label === label);

const CustomMark = ({ mark }) => {
  const markStyle = { fontWeight: "bold", fontSize: "1.3em" };

  return (
    <>
      {mark.favourite || isKeyEvent(mark.label) ? (
        <div style={{ position: "relative", paddingBottom: "-200px" }}>
          <div
            style={{
              position: "absolute",
              top: "-20px",
              minWidth: "80px",
              maxWidth: "5em",
              transform: `translateX(-50%) translateY(-65%)`,
              ...markStyle,
            }}
          >
            <span>{formatDuration(mark.value)}</span>
            <br />
            {mark.favourite ? (
              <BsStarFill color={COLOURS.PERSON_4} />
            ) : (
              <span style={{ whiteSpace: "normal" }}>{mark.label}</span>
            )}
          </div>
          <span
            style={{
              display: "block",
              width: "2px",
              position: "absolute",
              bottom: -8,
              height: "30px",
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
  const { Track, trackEvent } = useTracking({ page: "Debriefing" });

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
    <Track>
      <Card
        style={{
          height: "30vh",
          overflowY: "scroll",
          fontSize: "12px",
          marginTop: "-30px",
          backgroundColor: "#f0f0f0",
          cursor: "pointer",
        }}
      >
        <Card.Body>
          {formattedMarks.map((mark, index) => (
            <Row
              style={{
                marginLeft: "0px",
                marginRight: "0px",
                marginTop: "4px",
                marginBottom: "4px",
                backgroundColor: "white",
                borderRadius: "0.5em",
                padding: "0.5em 0",
                boxShadow:
                  "0px 4px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
              }}
              key={index}
              onClick={() => {
                trackEvent({
                  action: "click",
                  element: "clickOnLabelInTimelineCard",
                  data: mark.label,
                });
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
                {mark.favourite ? (
                  <BsStarFill size="0.7em" color={COLOURS.PERSON_4} />
                ) : isKeyEvent(mark.label) ? (
                  <BsCircleFill size="0.5em" color={COLOURS.KEY_EVENT_PURPLE} />
                ) : (
                  <BsCircle size="0.5em" color={COLOURS.ACTION_ORANGE} />
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
                {mark.performers.length > 0
                  ? " - " +
                    mark.performers
                      .map((performer) => performer.replace(/\s+/g, ""))
                      .join(", ")
                  : ""}
              </Col>
            </Row>
          ))}
        </Card.Body>
      </Card>
    </Track>
  );
};

/**
 *
 * Time slider and its button controller.
 * @param {*} trackEvent a method to track event.
 * @returns Div of time slider, phases buttons, and undo-redo buttons.
 */
export const TimeSliderController = ({ trackEvent }) => {
  const {
    range,
    setRange,
    setPlayHeadPosition,
    simDuration,
    timelineTags,
    index,
    lastIndex,
    undoTimeline,
    redoTimeline,
  } = useTimeline();

  const canUndo = index > 0;
  const canRedo = index < lastIndex;

  // keep value only for non key event tags
  const filterTimelineTagsForKeyEvent = (tags) => {
    return tags.map((tag) => {
      if (isKeyEvent(tag.label)) {
        return tag; // return the tag as is if it is a key event
      } else {
        return { value: tag.value, favourite: tag.favourite }; // return the tag without the label if it is not a key event
      }
    });
  };
  const modifiedTimelineTags = filterTimelineTagsForKeyEvent(timelineTags);

  // generate phases list
  const keyEvents = [
    ...modifiedTimelineTags.filter((item) => item.label),
  ].reverse();

  const phases = [
    {
      name: "All",
      start: 0,
      end: simDuration,
    },
    ...keyEvents.map((event, index, self) => ({
      name: event.label,
      start: event.value,
      end: self[index + 1]?.value || simDuration,
    })),
  ];

  // quick select phases
  const handleSelectPhase = (phase) => {
    setRange([phase.start, phase.end]);
  };

  return (
    <div>
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
        style={{ marginTop: "3em" }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "-30px",
        }}
      >
        <div style={timelineStyle.tinyDurationText}>{formatDuration(0)}</div>
        <div style={timelineStyle.tinyDurationText}>
          {formatDuration(simDuration)}
        </div>
      </div>
      <div>
        <Row
          style={{
            marginLeft: "5px",
            marginRight: "5px",
            marginTop: "5px",
          }}
        >
          {/* <Col
            xs="auto"
            style={{
              paddingLeft: "5px",
              paddingRight: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <p
              style={{
                color: "#6C757D",
                fontSize: "12px",
                margin: "auto",
              }}
            >
              Select:
            </p>
          </Col> */}

          <Col
            style={{
              paddingLeft: "5px",
              paddingRight: "5px",
              textAlign: "left",
            }}
            xs="auto"
          >
            <small>Phases: </small>
            <ButtonGroup aria-label="phases buttons">
              {phases.map((phase, index) => (
                <Button
                  key={index}
                  variant={
                    phase.start === range[0] && phase.end === range[1]
                      ? "dark"
                      : "outline-dark"
                  }
                  onClick={() => {
                    trackEvent({
                      action: "click",
                      element: "quickSelectPhaseButton",
                      data: phase,
                    });
                    handleSelectPhase(phase);
                  }}
                  style={{
                    fontSize: "12px",
                  }}
                >
                  {phase.name}
                </Button>
              ))}
            </ButtonGroup>
          </Col>
          <Col
            style={{
              paddingLeft: "5px",
              paddingRight: "5px",
              textAlign: "left",
            }}
            xs="auto"
          >
            <ButtonGroup aria-label="undo-redo">
              <Button
                variant="outline-dark"
                style={{
                  fontSize: "12px",
                }}
                onClick={() => {
                  trackEvent({
                    action: "click",
                    element: "undoTimelineSelectionButton",
                  });
                  undoTimeline();
                }}
                disabled={!canUndo}
              >
                Undo <BsArrowCounterclockwise size="1.2em" />
              </Button>
              <Button
                variant="outline-dark"
                style={{
                  fontSize: "12px",
                }}
                onClick={() => {
                  trackEvent({
                    action: "click",
                    element: "redoTimelineSelectionButton",
                  });
                  redoTimeline();
                }}
                disabled={!canRedo}
              >
                Redo <BsArrowClockwise size="1.2em" />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
    </div>
  );
};

const TimelineVisualisation = () => {
  const { Track, trackEvent } = useTracking({ page: "Debriefing" });
  // timeline range and playhead
  const { range, setRange, timelineTags } = useTimeline();
  return (
    <Track>
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
            <TimeSliderController trackEvent={trackEvent} />
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
    </Track>
  );
};

export default TimelineVisualisation;
