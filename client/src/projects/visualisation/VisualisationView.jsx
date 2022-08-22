import React, { useEffect, useState } from "react";
import * as Hive from "../hive";

import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { Button, ButtonGroup, Carousel, Image } from "react-bootstrap";

const VisualisationView = () => {
  const { simulationId } = useParams();
  const [index, setIndex] = useState(0);
  const [hasVisualisation, setHasVisualisation] = useState(true);

  const styles = {
    outer: {
      margin: "0 auto",
      maxWidth: "1440px",
      height: "100%",
      colour: "white",
    },
    carousel: { height: "90vh", width: "85vw" },
    middle: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "90vh",
    },
  };
  const csvUrl = process.env.PUBLIC_URL + "/api/visualisations/" + simulationId;

  const visualisations = [
    {
      id: "teamwork-barchart",
      label: "Teamwork",
      view: (
        <div style={styles.middle}>
          <Image
            width={"850px"}
            src={`${csvUrl}/teamwork-barchart`}
            onError={() => setHasVisualisation(false)}
          />
        </div>
      ),
    },
    {
      id: "hive-button",
      label: "Location and Speaking",
      view: <Hive.HiveView />,
    },
    {
      id: "audio-socnet",
      label: "Speaking Interaction",
      view: (
        <div style={styles.middle}>
          <Image
            width={"700px"}
            src={`${csvUrl}/audio-socnet`}
            onError={() => setHasVisualisation(false)}
          />{" "}
        </div>
      ),
    },
  ];

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <div style={styles.outer}>
      {/* <h3>Session {simulationId}</h3> */}
      {!hasVisualisation ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <h1>No Visualisation 🚩</h1>
          <p>
            Visualisations are not available due to incorrect data or missing
            files.
          </p>
        </div>
      ) : (
        <div>
          <ButtonGroup>
            {visualisations.map((d, index) => {
              return (
                <Button id={d.id} onClick={() => handleSelect(index)}>
                  {d.label}
                </Button>
              );
            })}
          </ButtonGroup>
          <Carousel
            activeIndex={index}
            onSelect={handleSelect}
            style={styles.carousel}
            interval={null}
          >
            {visualisations.map((d) => (
              <Carousel.Item> {d.view}</Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}

      <ReactTooltip />
    </div>
  );
};

export default VisualisationView;
