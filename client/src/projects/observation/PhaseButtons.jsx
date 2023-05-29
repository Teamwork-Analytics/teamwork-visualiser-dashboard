import { Button, ButtonGroup, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import { manualLabels, sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";
import Clock from "react-live-clock";

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
          <h5 className="mx-2 my-2"> Key events</h5>
          <ButtonGroup vertical="true" style={{ width: "95%" }}>
            {manualLabels.phases.map((d, i) => {
              return (
                <Button
                  key={i}
                  variant="outline-info"
                  size="md"
                  // disabled={observation.stopTime !== null}
                  onClick={() => addNote(d.label)}
                  // data-tip={d.description} // TODO: figure another way, ipad cant see tooltips
                >
                  {d.label}
                </Button>
              );
            })}
          </ButtonGroup>
        </Col>
        <Col md={7}>
          <h5 className="mx-2 my-2">Actions</h5>

          <ButtonGroup className="mx-2 my-2" style={{ width: "95%" }}>
            <Button
              variant="secondary"
              // disabled={observation.stopTime !== null}
              size="sm"
              onClick={() => addNote()}
            >
              Manual Tag +
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                toast.success("Notes are saved!");
              }}
            >
              Save
            </Button>
          </ButtonGroup>
          <ButtonGroup
            className="mx-2 my-2"
            vertical="true"
            style={{ width: "95%" }}
          >
            {manualLabels.actions.map((d, i) => {
              return (
                <Button
                  key={i}
                  variant="outline-dark"
                  size="md"
                  // disabled={observation.stopTime !== null}
                  onClick={() => addNote(d.label)}
                  // data-tip={d.description} // TODO: figure another way, ipad cant see tooltips
                >
                  {d.label}
                </Button>
              );
            })}
          </ButtonGroup>
        </Col>
      </Row>
    </div>
  );
};
export default PhaseButtons;
