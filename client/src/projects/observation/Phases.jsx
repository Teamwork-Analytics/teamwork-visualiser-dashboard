import { Col, Container, Row } from "react-bootstrap";
import Note from "./Note";
import { useObservation } from "./ObservationContext";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import Clock from "react-live-clock";

const Phases = () => {
  const { notes } = useObservation();

  return (
    <Container className="mt-3">
      <div style={{ fontSize: "12px" }}>
        <Clock
          format={"h:mm:ss a"}
          ticking={true}
          timezone={"Australia/Melbourne"}
        />
      </div>

      <Timeline
      // position="alternate"
      // style={{ width: "fit-content" }}
      >
        {notes.length === 0 ? (
          <small>- No available notes yet. -</small>
        ) : (
          notes.map((d, i) => {
            const keyString = `note-${i}`;
            let date = new Date(d.timestamp);
            let timeString = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });

            return (
              <TimelineItem key={keyString}>
                <TimelineOppositeContent
                  color="grey"
                  style={{ fontSize: "12px", maxWidth: "120px" }}
                >
                  {timeString}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot
                    color={
                      ["Ward Nurse", "Handover", "MET Doctor"].includes(
                        d.message
                      )
                        ? "error"
                        : "primary"
                    }
                    variant={
                      ["Ward Nurse", "Handover", "MET Doctor"].includes(
                        d.message
                      )
                        ? "filled"
                        : "outlined"
                    }
                  />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Container
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      padding: "2px",
                      textAlign: "center",
                      fontSize: "14px",
                      borderRadius: "3px",
                    }}
                  >
                    {d.message}
                  </Container>
                </TimelineContent>
              </TimelineItem>
            );
          })
        )}
        <TimelineItem>
          <TimelineOppositeContent
            style={{ minWidth: "120px", maxWidth: "120px" }}
          />

          <TimelineSeparator>
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent style={{ fontSize: "12px" }}>
            Simulation start
          </TimelineContent>
        </TimelineItem>
      </Timeline>
      <Row style={{ marginTop: "500px" }}>
        <Col>
          <Row>
            <Col sm="3">
              <h3 style={{ fontSize: "14px" }}>Timestamp</h3>
            </Col>
            <Col sm="7">
              <h3 style={{ fontSize: "14px" }}>Phase/Note</h3>
            </Col>
            <Col sm="2">
              <h3 style={{ fontSize: "14px" }}>Action</h3>
            </Col>
          </Row>
          <div className="mt-2">
            {notes.length === 0 ? (
              <small>- No available notes yet. -</small>
            ) : (
              notes.map((d, i) => {
                const keyString = `note-${i}`;
                // console.log(d);
                return (
                  <Note
                    id={keyString}
                    initialValue={d.message}
                    key={d._id}
                    data={d}
                  />
                );
              })
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Phases;
