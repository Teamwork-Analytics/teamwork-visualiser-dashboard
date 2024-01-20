/**
 * @file NursePerformBadges.jsx
 *
 * @description This component is responsible for rendering badges representing different performers
 * and managing the addition/removal of these performers in the context of a specific note.
 */

import { Badge, Row, Col } from "react-bootstrap";
import styled from "@emotion/styled";
import { COLOURS } from "../../../config/colours";
import ObservationAPI from "../../../services/api/observation";
import { useObservation } from "../ObservationContext";
import { useTracking } from "react-tracking";

// StyledBadge component applies different styles depending on whether the badge is selected or not.
const StyledBadge = styled(Badge)`
  background-color: ${(props) =>
    props.selected ? props.colour : "transparent"} !important;
  color: ${(props) => (props.selected ? "white" : props.colour)};
  border: 2px solid ${(props) => props.colour};
  opacity: ${(props) => (props.selected ? 1 : 0.7)};
`;

// NurseBadge component represents an individual nurse as a clickable badge.
const NurseBadge = ({ colour, label, onClick, selected }) => {
  return (
    <StyledBadge
      colour={colour}
      selected={selected}
      style={{ fontSize: "12px", margin: "2px" }}
      onClick={onClick}
    >
      {label}
    </StyledBadge>
  );
};

// NursePerformBadges component handles the display of badges for each nurse and manages the selection/deselection of nurses.
const NursePerformBadges = ({ noteId, sortNotesDescending }) => {
  const { Track, trackEvent } = useTracking({ page: "Observation" });
  const { observation, setNotes } = useObservation();

  // Find the note in the observation
  const note = observation.phases.find((note) => note._id === noteId);

  // handleClick function adds or removes a nurse from the performers list for a given note.
  const handleClick = (nurseType) => {
    if (note) {
      const performers = note.performers || [];
      const index = performers.indexOf(nurseType);

      if (index > -1) {
        // if the nurse is already a performer, remove them
        performers.splice(index, 1);
      } else {
        // otherwise, add them to the performers
        performers.push(nurseType);
      }

      // Update performers in the backend and refresh local data
      ObservationAPI.updateNotePerformers(
        observation._id,
        noteId,
        performers
      ).then((res) => {
        if (res.status === 200) {
          // Update the local state to reflect the change
          const phases = sortNotesDescending(res.data);
          setNotes(phases);
        }
      });
    } else {
      console.error("Could not find note with id:", noteId);
    }
  };

  return (
    <Track>
      <Row>
        <Col xs="auto">Performers: </Col>
        <Col>
          <div>
            {["PN 1", "PN 2", "SN 1", "SN 2"].map((nurse) => (
              <NurseBadge
                key={nurse}
                colour={
                  nurse.includes("PN")
                    ? COLOURS[`PRIMARY_NURSE_${nurse.split(" ")[1]}`]
                    : COLOURS[`SECONDARY_NURSE_${nurse.split(" ")[1]}`]
                }
                label={nurse}
                onClick={() => {
                  trackEvent({
                    action: "click",
                    element: "addPerformerBadge",
                    data: nurse,
                  });
                  handleClick(nurse);
                }}
                selected={note?.performers?.includes(nurse)}
              />
            ))}
          </div>
        </Col>
      </Row>
    </Track>
  );
};

export default NursePerformBadges;
