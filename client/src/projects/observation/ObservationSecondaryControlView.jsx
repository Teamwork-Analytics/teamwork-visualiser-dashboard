import { style } from "d3";
import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { fakeEmpaticaData } from "../../data/fakeData";

const ObservationSecondaryControlView = () => {
  const [empaticaData, setEmpaticaData] = useState(fakeEmpaticaData);

  const buttonClick = (empaticaId, isReset) => {
    const tempData = empaticaData.map((d) => {
      if (d.id === empaticaId) {
        d.time = Date.now();
      } else if (isReset) {
        d.time = undefined;
      }
      return d;
    });
    setEmpaticaData(tempData);
  };

  return (
    <div>
      <h1>Synchronisation</h1>
      <hr />
      <h3>
        Empatica{" "}
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            buttonClick(e.target.id, true);
          }}
        >
          Reset All
        </Button>
      </h3>
      <Container>
        {empaticaData.map((d) => {
          const time = !!d.time
            ? new Date(d.time).toISOString()
            : "No timestamp";
          return (
            <Row className="my-4">
              <Col sm="2">
                <label style={{ color: "grey" }}>{d.colour}</label>
              </Col>
              <Col>
                <label>{time}</label>
              </Col>
              <Col sm="2">
                <Button
                  id={d.id}
                  size="sm"
                  onClick={(e) => {
                    buttonClick(e.target.id, false);
                  }}
                >
                  Log
                </Button>
              </Col>
            </Row>
          );
        })}
      </Container>
    </div>
  );
};

export default ObservationSecondaryControlView;
