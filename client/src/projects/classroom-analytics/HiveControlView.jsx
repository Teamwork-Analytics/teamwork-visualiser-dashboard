import React, { useState } from "react";
import ReactSwitch from "react-switch";
import { useClassroomAnalytics } from "./ClassroomAnalyticsContext";
import "./Hive.css";
import { cssColourMatcher } from "./Hexagon";
import { taggingSocket } from "../observation/socket";
import { COLOUR_LABELS } from "./constants";

const ParticipantFilter = ({ colourCode }) => {
  const { pageState, setHiveState } = useClassroomAnalytics();

  const [checked, setChecked] = useState(pageState.participants[colourCode]);
  const handleChange = (nextChecked) => {
    setChecked(nextChecked);
    let modifiedParticipants = { ...pageState.participants };
    modifiedParticipants[colourCode] = nextChecked;
    setHiveState({
      ...pageState,
      participants: modifiedParticipants,
    });
    taggingSocket.emit("send-nurse-filter", {
      ...pageState,
      participants: modifiedParticipants,
    });
  };

  const colour = cssColourMatcher[colourCode];
  return (
    <label
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        fontSize: "0.8em",
      }}
    >
      <span>{COLOUR_LABELS[colourCode]}:</span>
      <ReactSwitch onChange={handleChange} checked={checked} onColor={colour} />
    </label>
  );
};

const HivePrimaryControlView = () => {
  const { pageState } = useClassroomAnalytics();
  const participantsKeys = Object.keys(pageState.participants);

  return (
    <div>
      <div className={"box"}>
        {/* <label style={{ color: "#5a5a5a" }}>FILTER:</label> */}
        {participantsKeys.map((k, i) => (
          <ParticipantFilter key={i} colourCode={k} />
        ))}
      </div>
    </div>
  );
};

export { ParticipantFilter, HivePrimaryControlView };
