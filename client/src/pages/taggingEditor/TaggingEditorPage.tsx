import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { defaultStyles as styles } from "../page-styles";
import BackButton from "../../components/buttons/BackButton";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Tab,
  Tabs,
} from "react-bootstrap";
import "./TaggingEditorPage.css";

const TaggingEditorPage = () => {
  const [editActionsClicked, setEditActionsClicked] = useState<boolean>(false);

  const params = useParams();
  const projectId = params.projectId ? params.projectId : "001";
  // const keyEvents = [
  //   { id: "001", name: "Handover primary nurse" },
  //   { id: "002", name: "Handover secondary nurse" },
  //   { id: "003", name: "MET call" },
  // ];

  const [keyEvents, setKeyEvents] = useState<any[]>([
    { id: "001", name: "Primary nurse entered" },
    { id: "002", name: "Secondary nurse entered" },
    { id: "003", name: "MET doc" },
    { id: "004", name: "General" },
  ]);
  const [newKeyEvent, setNewKeyEvent] = useState<string>("");

  const addKeyEvent = () => {
    if (newKeyEvent.trim() !== "") {
      setKeyEvents([...keyEvents, { id: "005", name: newKeyEvent }]);
      setNewKeyEvent("");
    }
  };

  const actions = [
    { id: "001", name: "Handover to primary nurse" },
    { id: "002", name: "Applying Oxygen" },
    { id: "003", name: "Reassessment" },
  ];

  return (
    <>
      <div style={styles.main}>
        <h4 className="tagging-editor-page-title">
          Tagging editor for project {projectId}
        </h4>
        <BackButton className="tagging-editor-back-button"></BackButton>
        <Container fluid className="tagging-editor-mid-container">
          <Row className="tagging-editor-content-row">
            <Card>
              <Tabs
                defaultActiveKey="key-event"
                className="mb-3"
                style={{ marginTop: "10px" }}
              >
                <Tab eventKey="key-event" title="Key events">
                  <h5 style={{ color: "black" }}>Key Events</h5>
                  {keyEvents.map((event) => (
                    <Card
                      key={event.id}
                      style={{ width: "100%", margin: "3px", color: "black" }}
                    >
                      <Card.Body>
                        <Card.Title style={{ fontSize: "14px" }}>
                          {event.name}
                        </Card.Title>
                        <Button
                          style={{ fontSize: "10px", margin: "1px" }}
                          variant="primary"
                        >
                          Edit key event
                        </Button>
                        <Button
                          style={{ fontSize: "10px", margin: "1px" }}
                          variant="primary"
                          onClick={() => setEditActionsClicked(true)}
                        >
                          Manage actions
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
                </Tab>
                <Tab eventKey="action" title="Actions">
                  <h5 style={{ color: "black" }}>Actions</h5>

                  {actions.map((action) => (
                    <Card
                      key={action.id}
                      style={{
                        width: "100%",
                        margin: "3px",
                        color: "black",
                      }}
                    >
                      <Card.Body>
                        <Card.Title style={{ fontSize: "14px" }}>
                          {action.name}
                        </Card.Title>
                        <Button
                          style={{ fontSize: "10px", margin: "1px" }}
                          variant="primary"
                        >
                          Edit action
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
                  <Form style={{ marginTop: "5px" }}>
                    <Form.Group className="mb-3" controlId="formAddEvent">
                      <Row style={{ width: "auto" }}>
                        <Col>
                          <Form.Control
                            type="text"
                            placeholder="Add new action"
                            value={newKeyEvent}
                            onChange={(e) => setNewKeyEvent(e.target.value)}
                          />
                        </Col>
                        <Col xs="auto">
                          <Button variant="primary" onClick={addKeyEvent}>
                            Add
                          </Button>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </Tab>
              </Tabs>
            </Card>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default TaggingEditorPage;
