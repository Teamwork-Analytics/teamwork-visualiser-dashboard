import { Button, Container, Row, Col } from "react-bootstrap";
import { manualLabels, sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";
import { BsThreeDotsVertical } from "react-icons/bs";

const PhaseButtons = () => {
  const { observation, setNotes } = useObservation();

  const addNote = (label = "") => {
    const data = {
      message: label,
      timeString: new Date(Date.now()).toISOString(),
    };

    ObservationAPI.recordNote(observation._id, data).then((res) => {
      if (res.status === 200) {
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
      }
    });
  };
  return (
    <div style={{ marginTop: "10px" }}>
      {/* <h1>
        <Clock
          format={"h:mm:ss a"}
          ticking={true}
          timezone={"Australia/Melbourne"}
        />
      </h1> */}
      <Row>
        <Col style={{ paddingRight: "0px" }}>
          <Container
            style={{
              padding: "2px",
              borderStyle: "solid",
              borderColor: "#CCCCCC",
              borderRadius: "15px",
              backgroundColor: "#F0F0F0",
              paddingBottom: "10px",
            }}
          >
            <h5 className="mx-2 my-2"> Key events</h5>

            {manualLabels.phases.map((d, i) => {
              return (
                <div style={{}}>
                  <Row style={{ marginBottom: "5px", marginTop: "5px" }}>
                    <Col style={{ paddingLeft: "15px", paddingRight: "0px" }}>
                      {" "}
                      <Button
                        key={i}
                        variant="outline-danger"
                        size="md"
                        onClick={() => addNote(d.label)}
                        style={{
                          width: "100%",
                          color: "black",
                          borderWidth: "3px",
                          fontWeight: "700",
                        }}
                        // data-tip={d.description} // TODO: figure another way, ipad cant see tooltips
                      >
                        {d.label}
                      </Button>
                    </Col>
                    <Col
                      xs="auto"
                      style={{ paddingLeft: "5px", paddingRight: "15px" }}
                    >
                      <Button
                        variant="outline-danger"
                        style={{
                          color: "black",
                          width: "100%",
                          borderWidth: "3px",
                        }}
                      >
                        <BsThreeDotsVertical />
                      </Button>
                    </Col>
                  </Row>
                </div>
              );
            })}
          </Container>
        </Col>
        <Col md={7}>
          <Container
            style={{
              padding: "2px",
              borderStyle: "solid",
              borderColor: "#CCCCCC",
              borderRadius: "15px",
              backgroundColor: "#F0F0F0",
              paddingBottom: "10px",
            }}
          >
            <h5 className="mx-2 my-2">Actions</h5>

            <Button
              variant="success"
              size="md"
              onClick={() => addNote()}
              style={{
                width: "95%",
                fontWeight: "600",
                marginTop: "5px",
                marginBottom: "5px",
              }}
            >
              Add new action +
            </Button>

            {manualLabels.actions.map((d, i) => {
              return (
                <Button
                  key={i}
                  variant="outline-primary"
                  size="md"
                  onClick={() => addNote(d.label)}
                  // data-tip={d.description} // TODO: figure another way, ipad cant see tooltips
                  style={{
                    width: "95%",
                    marginBottom: "5px",
                    marginTop: "5px",
                    color: "black",
                    borderWidth: "3px",
                    fontWeight: "500",
                  }}
                >
                  {d.label}
                </Button>
              );
            })}
          </Container>
        </Col>
      </Row>
    </div>
  );
};
export default PhaseButtons;
