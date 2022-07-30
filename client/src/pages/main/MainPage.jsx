import React from "react";
import { defaultStyles as styles } from "../page-styles";
import { Link } from "react-router-dom";
import SessionCard from "./SessionCard";
import { Button } from "react-bootstrap";
import { MainProvider, useMain } from "./MainContext";

/**
 * First page to select and create sessions
 */
const MainPage = () => {
  const pageStyles = {
    list: {
      display: "flex",
      flexDirection: "column",
      flexWrap: "wrap",
      alignContent: "center",
      columnGap: "2em",
      rowGap: "1.5em",
    },
    navigation: {
      padding: "1em",
      textAlign: "center",
      borderRadius: "0.5em",
    },
    control: {
      display: "flex",
      width: "100%",
      padding: "1em",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
  };

  const { simulations } = useMain();

  return (
    <div style={styles.main}>
      <h1 style={styles.title}>TEAMWORK ANALYTICS 🖥️</h1>
      <div style={pageStyles.control}>
        <Button variant="success" disabled>
          Add Session +
        </Button>
      </div>

      <div style={{ overflowY: "scroll", width: "100vw" }}>
        <div style={pageStyles.list}>
          {!!simulations
            ? simulations.map((sim, i) => (
                <Link
                  key={i}
                  to={`/visualisation/${sim.sessionId}`}
                  state={{ name: sim.name }}
                  style={{ color: "#222222", textDecoration: "none" }}
                >
                  <SessionCard key={i} sim={sim} />
                </Link>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};

const MainPageContainer = () => {
  return (
    <MainProvider>
      <MainPage />
    </MainProvider>
  );
};

export default MainPageContainer;
