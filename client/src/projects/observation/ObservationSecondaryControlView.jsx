import { style } from "d3";
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { fakeEmpaticaData } from "../../data/fakeData";

const ObservationSecondaryControlView = () => {
  const [empaticaData, setEmpaticaData] = useState(fakeEmpaticaData);
  const styles = {
    outer: {
      display: "flex",
      justifyContent: "space-between",
      margin: "1em 0",
    },
    buttons: {
      display: "flex",
      justifyContent: "space-evenly",
    },
  };

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

      <div>
        {empaticaData.map((d) => {
          const time = !!d.time
            ? new Date(d.time).toISOString()
            : "No timestamp";
          return (
            <div style={styles.outer}>
              <label style={{ color: "grey" }}>{d.colour}</label>
              <label>{time}</label>
              <div style={styles.buttons}>
                <Button
                  id={d.id}
                  size="sm"
                  onClick={(e) => {
                    buttonClick(e.target.id, false);
                  }}
                >
                  Log
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ObservationSecondaryControlView;
