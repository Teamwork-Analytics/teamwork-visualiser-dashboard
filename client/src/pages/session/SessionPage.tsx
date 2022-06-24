import React from "react";
import { fakeSessions } from "../../data/fakeData";
import { defaultStyles as styles } from "../page-styles";
import { Link } from "react-router-dom";
import SessionCard from "./SessionCard";
import SearchBar from "../../components/SearchBar";
import { Session } from "./Session";

/**
 * First page to select and create sessions
 */
const SessionPage = () => {
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
      maxWidth: "900px",
      width: "30vw",
      padding: "1em",
      textAlign: "center" as const,
      borderRadius: "0.5em",
    },
  };
  return (
    <div style={styles.main}>
      <h1 style={styles.title}>SESSIONS</h1>
      <div style={pageStyles.navigation}>
        <SearchBar />
      </div>
      <div style={{ width: 900, margin: "0 auto" }}>
        <div style={pageStyles.list}>
          {fakeSessions.map((session: Session) => (
            <Link
              to={`/visualisation/${session.name}`}
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

export default SessionPage;
