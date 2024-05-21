import React, { useState } from "react";
import ReactSwitch from "react-switch";
import { useHive } from "./HiveContext";
import "./Hive.css";
import { cssColourMatcher } from "./Hexagon";
import { taggingSocket } from "../../observation/socket";
import { COLOUR_LABELS } from "./constants";

const ParticipantFilter = ({ colourCode, projectCode }) => {
  const { hiveState, hiveSetState } = useHive();

  const [checked, setChecked] = useState(hiveState.participants[colourCode]);

  const handleChange = (nextChecked) => {
    setChecked(nextChecked);
    let modifiedParticipants = { ...hiveState.participants };
    modifiedParticipants[colourCode] = nextChecked;
    hiveSetState({
      ...hiveState,
      participants: modifiedParticipants,
    });
    taggingSocket.emit("send-nurse-filter", {
      ...hiveState,
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
      <span>{COLOUR_LABELS[projectCode][colourCode]}:</span>
      <ReactSwitch onChange={handleChange} checked={checked} onColor={colour} />
    </label>
  );
};

const HivePrimaryControlView = ({ projectCode }) => {
  const { hiveState } = useHive();
  const participantsKeys = Object.keys(hiveState.participants);

  return (
    <div>
      <div className={"box"}>
        {/* <label style={{ color: "#5a5a5a" }}>FILTER:</label> */}
        {participantsKeys.map((k, i) => (
          <ParticipantFilter key={i} colourCode={k} projectCode={projectCode} />
        ))}
      </div>
    </div>
  );
};

export { ParticipantFilter, HivePrimaryControlView };
