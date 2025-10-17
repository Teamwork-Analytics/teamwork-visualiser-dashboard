/**
 * NurseNameBadges.jsx
 *
 * This component is responsible for displaying and editing the nurse names.
 * It includes a feature to edit the nurse names directly within the badges.
 */

import { Badge } from "react-bootstrap";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { COLOURS } from "../../../config/colours";
import { useNurseName } from "./NurseNameContext";
import { useTracking } from "react-tracking";
import { simulationColoursSetting } from "../../../config/simulation";

// override bootstrap badge important style
const StyledBadge = styled(Badge)`
  background-color: ${(props) => props.colour} !important;
`;

const StyledInput = styled.input`
  border: none;
  outline: none;
  width: auto;
  height: auto;
`;

// The badge component that allows editing its text.
const EditableBadge = ({ colour, label, nurseName, onUpdate }) => {
  const { Track, trackEvent } = useTracking({ page: "NurseNameBadges" });
  const [name, setName] = useState(nurseName);

  // Add this useEffect to update the name state when nurseName prop updates
  useEffect(() => {
    setName(nurseName);
  }, [nurseName]);

  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(name); // pass the new name to parent component when finish editing
  };

  const handleFocus = () => setIsEditing(true);

  const handleChange = (event) => setName(event.target.value);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.target.blur();
    }
  };

  return (
    <Track>
      <StyledBadge colour={colour} style={{ fontSize: "12px", margin: "2px" }}>
        {label}:{" "}
        {isEditing ? (
          <StyledInput
            value={name}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span
            onClick={() => {
              trackEvent({
                action: "click",
                element: "nurseNameBadge",
                data: label,
              });
              handleFocus();
            }}
          >
            {name || "Name"}
          </span>
        )}
      </StyledBadge>
    </Track>
  );
};

// The main component that manages the state of nurse names and handle API calls.
const NurseNameBadges = () => {
  const { nurseNames, updateNurseName } = useNurseName();

  return (
    <div>
      {
        Object.keys(simulationColoursSetting).map((key) => {
          const colourSetting = simulationColoursSetting[key];
          console.log(colourSetting)
          return <EditableBadge
              colour={colourSetting.COLOUR}
              label={colourSetting.SHORT_TITLE}
              nurseName={nurseNames[colourSetting.LONG_TITLE] || ""}
              onUpdate={(newName) => updateNurseName(colourSetting.LONG_TITLE, newName)}
            />
        })
      }
    </div>
  );
};

export default NurseNameBadges;
