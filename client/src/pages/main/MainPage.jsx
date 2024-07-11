import React, { useState } from "react";
import { defaultStyles as styles } from "../page-styles";
import { Link } from "react-router-dom";
import SessionCard from "./SessionCard";
import { Button, Form } from "react-bootstrap";
import { MainProvider, useMain } from "./MainContext";

/**
 * First page to select and create simulations
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
      padding: "1em",
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
      columnGap: "2em",
    },
  };
  const { simulations } = useMain();
  const [q, setQ] = React.useState("");
  const [params] = React.useState(["simulationId", "name"]);

  function search(items) {
    return items.filter((item) =>
      params.some((paramItem) =>
        item[paramItem].toLowerCase().indexOf(q.toLowerCase() > -1)
      )
    );
  }

  return (
    <div style={styles.main}>
      <h1 style={styles.title}>TEAMWORK ANALYTICS 🖥️</h1>
      <div style={pageStyles.control}>
        <Form>
          <Form.Control
            type={"search"}
            placeholder={"Search..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Form>
        <Link to="/projects" style={{ textDecoration: "none" }}>
          <Button variant="success">Manage Projects</Button>
        </Link>
      </div>
      <div style={{ overflowY: "scroll", width: "100vw" }}>
        <div style={pageStyles.list}>
          {!!simulations
            ? search(simulations)
                .filter(
                  (sim) =>
                    sim.project.name === process.env.REACT_APP_PROJECT_NAME
                )
                .map((sim, i) => (
                  <Link
                    key={i}
                    to={`/visualisation/${sim.simulationId}`}
                    state={{ name: sim.name, realId: sim._id }}
                    style={{ color: "#222222", textDecoration: "none" }}
                  >
                    <SessionCard key={i} sim={sim} />
                  </Link>
                ))
            : null}
        </div>
      </div>
      ;
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
