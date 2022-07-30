import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { fakeDevicesData } from "../../data/fakeData";

const ObservationSecondaryControlView = () => {
  const [devices, setDevices] = useState(fakeDevicesData);

  const buttonClick = (empaticaId, isReset) => {
    const tempDevice = devices.map((d) => {
      if (d.id === empaticaId) {
        d.time = Date.now();
      } else if (isReset) {
        d.time = undefined;
      }
      return d;
    });
    setDevices(tempDevice);
  };

  return (
    <div>
      <h1>Synchronisation</h1>
      <hr />
      <Button
        variant="danger"
        size="sm"
        onClick={(e) => {
          buttonClick(e.target.id, true);
        }}
      >
        Reset All
      </Button>

      <Container>
        {devices.map((d, i) => {
          const time = !!d.time
            ? new Date(d.time).toLocaleString()
            : "No timestamp";
          return (
            <Row key={d.id} className="my-4">
              <Col sm="3">
                <label style={{ color: "grey" }}>{d.name}</label>
              </Col>
              <Col sm="7">
                <label>{time}</label>
              </Col>
              <Col sm="1">
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
