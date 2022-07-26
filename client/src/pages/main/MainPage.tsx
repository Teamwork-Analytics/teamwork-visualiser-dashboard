import React from "react";
import { fakeTeams } from "../../data/fakeData";
import { defaultStyles as styles } from "../page-styles";
import { Link } from "react-router-dom";
import SessionCard from "./SessionCard";
import SearchBar from "../../components/SearchBar";
import { Team } from "./Session";
import { Button } from "react-bootstrap";

/**
 * First page to select and create sessions
 */
const MainPage = () => {
  const pageStyles = {
    list: {
      display: "flex",
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      alignContent: "flexStart",
      columnGap: "2em",
      rowGap: "2em",
    },
    navigation: {
      padding: "1em",
      textAlign: "center" as const,
      borderRadius: "0.5em",
    },
    control: {
      display: "flex",
      width: "100%",
      padding: "1em",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row" as const,
    },
  };
  return (
    <div style={styles.main}>
      <h1 style={styles.title}>TEAMWORK ANALYTICS 🖥️</h1>
      <div style={pageStyles.control}>
        <Button variant="success">Add Session +</Button>
      </div>

      <div style={{ width: 900, margin: "1em auto" }}>
        <div style={pageStyles.list}>
          {fakeTeams.map((session: Team) => (
            <Link
              to={`/visualisation/${session.sessionId}`}
              state={{ name: session.name }}
              style={{ color: "#222222", textDecoration: "none" }}
            >
              <SessionCard team={session} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
