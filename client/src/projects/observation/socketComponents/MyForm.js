import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";

import Image from "react-bootstrap/Image";
import Modal from "react-bootstrap/Modal";
import samplePreview from "../images/sample-preview.png";
import timelineVis from "../images/timeline-vis.png";
import { FaBackward, FaForward, FaPlay, FaPause, FaRedo } from "react-icons/fa";
import VisualisationsPicker from "./VisualisationsPicker";

export function MyForm() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const play = () => {
    setIsPlaying(true);
    // Add code to play media
  };

  const pause = () => {
    setIsPlaying(false);
    // Add code to pause media
  };

  const skipBack = () => {
    // Add code to skip back 5 seconds
  };

  const skipForward = () => {
    // Add code to skip forward 5 seconds
  };

  const startFromBeginning = () => {
    // Add code to start from beginning
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    // Add code to change playback rate
  };

  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const showPreviewModalPressed = (visSelected) => {
    console.log(visSelected);
    setShowPreviewModal(true);
  };

  const hidePreviewModal = () => {
    setShowPreviewModal(false);
  };

  return (
    <>
      <VisualisationsPicker />

      <div
        style={{
          marginTop: "-10px",
          marginBottom: "-20px",
          marginLeft: "20px",
        }}
      >
        Playback controller:
      </div>

      {/* PLAYBACK CONTROLLER */}
      {/* <div
        style={{
          display: "flex",
          justifyContent: "center",
          border: "1px solid lightgray",
          borderRadius: "1em",
          padding: "10px",
          // maxWidth: "18vw",
          maxHeight: "50vh",
          margin: "20px",
        }}
      >
        <ButtonGroup horizontal>
          <Button variant="dark" onClick={startFromBeginning}>
            <FaRedo />
            <br />
            Restart
          </Button>
          <Button variant="outline-dark" onClick={skipBack}>
            <FaBackward />
            <br />
            Back 5s
          </Button>
          <Button variant="outline-dark" onClick={isPlaying ? pause : play}>
            {isPlaying ? (
              <>
                <FaPause />
                <br />
                Pause
              </>
            ) : (
              <>
                <FaPlay />
                <br />
                Play
              </>
            )}
          </Button>
          <Button variant="outline-dark" onClick={skipForward}>
            <FaForward />
            <br />
            Forward 5s
          </Button>
          <Dropdown
            onSelect={(eventKey) =>
              changePlaybackRate(parseFloat(eventKey || "1"))
            }
          >
            <Dropdown.Toggle variant="outline-dark">
              Speed: {playbackRate}x
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="0.5">0.5x</Dropdown.Item>
              <Dropdown.Item eventKey="1">1x</Dropdown.Item>
              <Dropdown.Item eventKey="1.5">1.5x</Dropdown.Item>
              <Dropdown.Item eventKey="2">2x</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </ButtonGroup>
      </div> */}

      <Modal show={showPreviewModal} onHide={hidePreviewModal}>
        <Modal.Header closeButton>
          <Modal.Title>Preview if you selected the visualisation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Image src={samplePreview} fluid />
        </Modal.Body>
      </Modal>

      {/* TIMELINE VISUALISATION */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          flexDirection: "column",
          border: "1px solid lightgray",
          borderRadius: "5px",
          padding: "10px",
          maxWidth: "100vw",
          maxHeight: "40vh",
          margin: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            border: "1px solid lightgray",
            borderRadius: "1em",
            padding: "10px",
            // maxWidth: "18vw",
            maxHeight: "50vh",
            margin: "20px",
          }}
        >
          <ButtonGroup horizontal>
            <Button variant="dark" onClick={startFromBeginning}>
              <FaRedo />
              <br />
              Restart
            </Button>
            <Button variant="outline-dark" onClick={skipBack}>
              <FaBackward />
              <br />
              Back 5s
            </Button>
            <Button variant="outline-dark" onClick={isPlaying ? pause : play}>
              {isPlaying ? (
                <>
                  <FaPause />
                  <br />
                  Pause
                </>
              ) : (
                <>
                  <FaPlay />
                  <br />
                  Play
                </>
              )}
            </Button>
            <Button variant="outline-dark" onClick={skipForward}>
              <FaForward />
              <br />
              Forward 5s
            </Button>
            <Dropdown
              onSelect={(eventKey) =>
                changePlaybackRate(parseFloat(eventKey || "1"))
              }
            >
              <Dropdown.Toggle variant="outline-dark">
                Speed: {playbackRate}x
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="0.5">0.5x</Dropdown.Item>
                <Dropdown.Item eventKey="1">1x</Dropdown.Item>
                <Dropdown.Item eventKey="1.5">1.5x</Dropdown.Item>
                <Dropdown.Item eventKey="2">2x</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ButtonGroup>
        </div>
        <Image src={timelineVis} style={{ width: "90vw" }}></Image>
      </div>

      {/* {!hideOtherComponent && (
        <Card style={{ width: "18rem", margin: "20px" }}>
          <Card.Header>This component connected to socket io</Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="displayType">
                <Form.Label>Choose display type</Form.Label>
                <Form.Check
                  type="radio"
                  name="displayType"
                  id="videoDisplay"
                  label="Video display"
                  value="video"
                  checked={displayType === "video"}
                  onChange={(e) => setDisplayType(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  name="displayType"
                  id="mapDisplay"
                  label="Map display"
                  value="map"
                  checked={displayType === "map"}
                  onChange={(e) => setDisplayType(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  name="displayType"
                  id="youtubeDisplay"
                  label="Intro video display"
                  value="youtube"
                  checked={displayType === "youtube"}
                  onChange={(e) => setDisplayType(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )} */}
    </>
  );
}
