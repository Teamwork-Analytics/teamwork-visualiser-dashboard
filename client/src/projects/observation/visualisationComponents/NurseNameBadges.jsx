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
import PrivateNoteAPI from "../../../services/api/privateNote";
import { useParams } from "react-router-dom";

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
        <span onClick={handleFocus}>{name || "Name"}</span>
      )}
    </StyledBadge>
  );
};

// The main component that manages the state of nurse names and handle API calls.
const NurseNameBadges = () => {
  const simulationId = useParams().simulationId;
  const [nurseNames, setNurseNames] = useState({});

  useEffect(() => {
    PrivateNoteAPI.get(simulationId).then((res) => {
      if (res.status === 200) {
        setNurseNames(res.data.nurses);
      }
    });
  }, [simulationId]);

  // Update a specific nurse name
  const updateNurseName = (nurseType, newName) => {
    let updatedNurseNames = { ...nurseNames };
    updatedNurseNames[nurseType] = newName;
    PrivateNoteAPI.update(simulationId, updatedNurseNames)
      .then((res) => {
        if (res.status === 200) {
          setNurseNames(res.data.nurses);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <EditableBadge
        colour={COLOURS.PRIMARY_NURSE_1}
        label="PM 1"
        nurseName={nurseNames.primaryNurse1 || ""}
        onUpdate={(newName) => updateNurseName("primaryNurse1", newName)}
      />
      <EditableBadge
        colour={COLOURS.PRIMARY_NURSE_2}
        label="PM 2"
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
