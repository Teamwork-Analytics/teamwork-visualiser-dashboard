import React from "react";
import { fakeSessions } from "../../data/fakeData";
import { defaultStyles as styles } from "../page-styles";
import { Link } from "react-router-dom";
import SessionCard from "./SessionCard";
import SearchBar from "../../components/SearchBar";
import { Session } from "./Session";
import { Button } from "react-bootstrap";

/**
 * First page to select and create sessions
 */
const SessionsPage = () => {
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
      <h1 style={styles.title}>TEAMWORK VISUALISATION DASHBOARD 🖥️</h1>
      <div style={pageStyles.control}>
        <div style={pageStyles.navigation}>
          <SearchBar />
        </div>
        <Button variant="success">Add Session +</Button>
      </div>

      <div style={{ width: 900, margin: "1em auto" }}>
        <div style={pageStyles.list}>
          {fakeSessions.map((session: Session) => (
            <Link
              to={`/visualisation/${session.sessionId}`}
              state={{ name: session.name }}
              style={{ color: "#222222", textDecoration: "none" }}
            >
              <SessionCard session={session} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
