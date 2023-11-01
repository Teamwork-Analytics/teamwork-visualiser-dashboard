import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { defaultStyles as styles } from "../page-styles";
import BackButton from "@components/buttons/BackButton";
import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  Row,
  Tab,
  Tabs,
} from "react-bootstrap";
import "./TaggingEditorPage.css";
import { BsCheckSquare, BsSquare } from "react-icons/bs";

const TaggingEditorPage = () => {
  const params = useParams();
  const projectId = params.projectId ? params.projectId : "001";

  const labels = [
    "clinical - phase 1",
    "clinical - phase 2",
    "clinical - phase 3",
    "general teamwork",
  ];

  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const handleSelectLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter((item) => item !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

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

  const [actions, setActions] = useState<any[]>([
    { id: "001", name: "Handover to primary nurse" },
    { id: "002", name: "Applying Oxygen" },
    { id: "003", name: "Reassessment" },
  ]);

  const [newAction, setNewAction] = useState<string>("");
  const addAction = () => {
    if (newAction.trim() !== "") {
      setActions([...actions, { id: "005", name: newAction }]);
      setNewAction("");
      setSelectedLabels([]);
    }
  };

  return (
    <>
      <div style={styles.main}>
        <h4 className="tagging-editor-page-title">Tagging Editor</h4>
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
                  <h5 style={{ color: "black" }}>
                    Manage key events in project {projectId}
                  </h5>
                  {keyEvents.map((event) => (
                    <Card
                      key={event.id}
                      style={{
                        width: "80%",
                        color: "black",
                        margin: "auto",
                        marginTop: "3px",
                        marginBottom: "3px",
                      }}
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
                      </Card.Body>
                    </Card>
                  ))}
                  <Form
                    style={{
                      width: "80%",
                      margin: "auto",
                      marginTop: "5px",
                      marginBottom: "20px",
                    }}
                  >
                    <Form.Group className="mb-3" controlId="formAddEvent">
                      <Row style={{ width: "auto" }}>
                        <Col>
                          <Form.Control
                            type="text"
                            placeholder="Add new key event"
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
                <Tab eventKey="action" title="Actions">
                  <h5 style={{ color: "black" }}>
                    Manage actions in project {projectId}
                  </h5>

                  {actions.map((action) => (
                    <Card
                      key={action.id}
                      style={{
                        width: "80%",
                        margin: "auto",
                        marginTop: "3px",
                        marginBottom: "3px",
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
                  <Form
                    style={{
                      width: "80%",
                      margin: "auto",
                      marginTop: "5px",
                      marginBottom: "60px",
                    }}
                  >
                    <Row style={{ width: "auto" }}>
                      <Col>
                        <Form.Group className="mb-3" controlId="formAddEvent">
                          <Form.Control
                            type="text"
                            placeholder="Add new action"
                            value={newAction}
                            onChange={(e) => setNewAction(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs="auto">
                        <Dropdown autoClose="outside">
                          <Dropdown.Toggle>Assign key events</Dropdown.Toggle>
                          <Dropdown.Menu>
                            {labels.map((label, _) => (
                              <Dropdown.Item
                                onClick={() => handleSelectLabel(label)}
                                key={label}
                                eventKey={label}
                                active={selectedLabels.includes(label)}
                              >
                                {selectedLabels.includes(label) ? (
                                  <BsCheckSquare />
                                ) : (
                                  <BsSquare />
                                )}
                                {" " + label}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </Col>
                      <Col xs="auto">
                        <Button variant="primary" onClick={addAction}>
                          Add
                        </Button>
                      </Col>
                    </Row>
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
