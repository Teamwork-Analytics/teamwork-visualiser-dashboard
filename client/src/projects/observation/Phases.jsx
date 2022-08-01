import { Col, Container, Row } from "react-bootstrap";
import Note from "./Note";
import { useObservation } from "./ObservationContext";

const Phases = () => {
  const { notes } = useObservation();

  return (
    <Container className="mt-3">
      <Row>
        <Col sm="3">
          <h3>Timestamp</h3>
        </Col>
        <Col sm="7">
          <h3>Phase/Note</h3>
        </Col>
        <Col sm="2">
          <h3>Action</h3>
        </Col>
      </Row>
      <div className="mt-2">
        {notes.length === 0 ? (
          <small>- No available notes yet. -</small>
        ) : (
          notes.map((d, i) => {
            const keyString = `note-${i}`;
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
    </Container>
  );
};

export default Phases;
