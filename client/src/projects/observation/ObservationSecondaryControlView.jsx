import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import EmptyPlaceholder from "../../components/EmptyPlaceholder";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";

const ObservationSecondaryControlView = () => {
  const { observation, setObservation } = useObservation();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    setDevices(observation.synchronisations);
  }, [observation]);

  const buttonClick = (deviceId, deviceName) => {
    const data = {
      deviceId: deviceId,
      timeString: new Date(Date.now()).toISOString(),
    };
    ObservationAPI.syncDeviceTime(observation._id, data).then((res) => {
      if (res.status === 200) {
        setDevices(res.data.synchronisations);
        setObservation(res.data);
        toast.success(
          `${deviceName} has been synchronised at ${data.timeString}`
        );
      }
    });
    const tempDevice = devices.map((d) => {
      if (d.device._id === deviceId) {
        d.syncTime = Date.now();
      }
      return d;
    });
    setDevices(tempDevice);
  };

  return (
    <div>
      <h1>Synchronisation</h1>
      <hr />

      <Container>
        {devices.length === 0 ? (
          <EmptyPlaceholder />
        ) : (
          devices.map((data, i) => {
            const d = data.device;
            const time = !!data.syncTime
              ? new Date(data.syncTime).toLocaleString()
              : "No timestamp";

            return (
              <Row key={d._id} className="my-4">
                <Col sm="3">
                  <label style={{ color: "grey" }}>{d.name}</label>
                  <label>{d.deviceType}</label>
                </Col>
                <Col sm="7">
                  <label>{time}</label>
                </Col>
                <Col sm="1">
                  <Button
                    id={d._id}
                    size="sm"
                    onClick={(e) => {
                      buttonClick(e.target.id, `${d.name} ${d.deviceType}`);
                    }}
                  >
                    Log
                  </Button>
                </Col>
              </Row>
            );
          })
        )}
      </Container>
    </div>
  );
};

export default ObservationSecondaryControlView;
