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
      <EditableBadge
        colour={COLOURS.PRIMARY_NURSE_1}
        label="PN 1"
        nurseName={nurseNames.primaryNurse1 || ""}
        onUpdate={(newName) => updateNurseName("primaryNurse1", newName)}
      />
      <EditableBadge
        colour={COLOURS.PRIMARY_NURSE_2}
        label="PN 2"
        nurseName={nurseNames.primaryNurse2 || ""}
        onUpdate={(newName) => updateNurseName("primaryNurse2", newName)}
      />
      <EditableBadge
        colour={COLOURS.SECONDARY_NURSE_1}
        label="SN 1"
        nurseName={nurseNames.secondaryNurse1 || ""}
        onUpdate={(newName) => updateNurseName("secondaryNurse1", newName)}
      />
      <EditableBadge
        colour={COLOURS.SECONDARY_NURSE_2}
        label="SN 2"
        nurseName={nurseNames.secondaryNurse2 || ""}
        onUpdate={(newName) => updateNurseName("secondaryNurse2", newName)}
      />
    </div>
  );
};

export default NurseNameBadges;
