import React, { useState } from "react";
import ReactSwitch from "react-switch";
import { useHive } from "./HiveContext";
import "./Hive.css";
import { cssColourMatcher } from "./Hexagon";

const ParticipantFilter = ({ colourCode }) => {
  const { state, setState } = useHive();

  const [checked, setChecked] = useState(state.participants[colourCode]);
  const handleChange = (nextChecked) => {
    setChecked(nextChecked);
    let modifiedParticipants = { ...state.participants };
    modifiedParticipants[colourCode] = nextChecked;
    setState({
      ...state,
      participants: modifiedParticipants,
    });
  };

  const colour = cssColourMatcher[colourCode];
  return (
    <label
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "0.2em 0.2em",
        width: "40%",
      }}
    >
      <span>{colourCode}</span>
      <ReactSwitch onChange={handleChange} checked={checked} onColor={colour} />
    </label>
  );
};

const HivePrimaryControlView = () => {
  const { state } = useHive();
  const participantsKeys = Object.keys(state.participants);

  return (
    <div>
      <h3 className="mb-4">FILTER</h3>
      <div className={"box"}>
        {participantsKeys.map((k, i) => (
          <ParticipantFilter key={i} colourCode={k} />
        ))}
      </div>
    </div>
  );
};

export default HivePrimaryControlView;
