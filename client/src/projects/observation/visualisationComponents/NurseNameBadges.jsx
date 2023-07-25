import { Badge } from "react-bootstrap";
import { useState } from "react";
import styled from "@emotion/styled";
import { COLOURS } from "../../../config/colours";

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

const EditableBadge = ({ colour, label }) => {
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = () => setIsEditing(false);

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

const NurseNameBadges = () => {
  return (
    <div>
      <EditableBadge colour={COLOURS.PRIMARY_NURSE_1} label="PM 1" />
      <EditableBadge colour={COLOURS.PRIMARY_NURSE_2} label="PM 2" />
      <EditableBadge colour={COLOURS.SECONDARY_NURSE_1} label="SN 1" />
      <EditableBadge colour={COLOURS.SECONDARY_NURSE_2} label="SN 2" />
    </div>
  );
};

export default NurseNameBadges;
