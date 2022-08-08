import React, { useEffect, useState } from "react";
import * as Hive from "../hive";

import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { Button, ButtonGroup, Carousel } from "react-bootstrap";

const VisualisationView = () => {
  const { simulationId } = useParams();
  const [index, setIndex] = useState(0);

  const styles = {
    outer: {
      margin: "0 auto",
      maxWidth: "1440px",
      height: "100%",
      colour: "white",
    },

    carousel: { height: "90vh", width: "70vw" },
  };

  const visualisations = [
    {
      id: "tw-barchart",
      label: "Teamwork",
      view: <div>Teamwork </div>,
    },
    {
      id: "hive",
      label: "Location and Speaking",
      view: <Hive.HiveView />,
    },
    {
      id: "audio-socnet",
      label: "Speaking Interaction",
      view: <div>Speaking </div>,
    },
  ];

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <div style={styles.outer}>
      {/* <h3>Session {simulationId}</h3> */}
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
      <ReactTooltip />
    </div>
  );
};

export default VisualisationView;
