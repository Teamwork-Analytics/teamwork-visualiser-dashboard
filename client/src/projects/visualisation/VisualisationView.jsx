import React, { useEffect, useState } from "react";
import * as Hive from "../hive";

import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { Carousel } from "react-bootstrap";

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

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };
  return (
    <div style={styles.outer}>
      <h3>Session {simulationId}</h3>
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        style={styles.carousel}
        interval={null}
      >
        <Carousel.Item>
          <Hive.HiveView />
        </Carousel.Item>
        <Carousel.Item>Something</Carousel.Item>
        <Carousel.Item>Something</Carousel.Item>
      </Carousel>
      <ReactTooltip />
    </div>
  );
};

export default VisualisationView;
