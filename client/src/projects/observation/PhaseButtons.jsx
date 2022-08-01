import { Button, ButtonGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { manualLabels, sortNotesDescending } from ".";
import ObservationAPI from "../../services/api/observation";
import { useObservation } from "./ObservationContext";

const PhaseButtons = () => {
  const { observation, setNotes } = useObservation();
  const addNote = (label = "") => {
    const data = {
      message: label,
      timeString: new Date(Date.now()).toISOString(),
    };

    ObservationAPI.recordNote(observation._id, data).then((res) => {
      if (res.status === 200) {
        const phases = sortNotesDescending(res.data);
        setNotes(phases);
      }
    });
  };
  return (
    <div>
      <ButtonGroup className="mx-2 my-2">
        {manualLabels.phases.map((d, i) => {
          return (
            <Button
              key={i}
              variant="primary"
              size="lg"
              onClick={() => addNote(d.label)}
              data-tip={d.description}
            >
              {d.label}
            </Button>
          );
        })}
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="secondary" size="lg" onClick={() => addNote()}>
          Manual Tag +
        </Button>
        <Button
          variant="success"
          size="lg"
          onClick={() => {
            toast.success("Notes are saved!");
          }}
        >
          Save
        </Button>
      </ButtonGroup>
    </div>
  );
};
export default PhaseButtons;
