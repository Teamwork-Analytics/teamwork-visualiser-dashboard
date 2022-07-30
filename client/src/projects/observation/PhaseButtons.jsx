import { Button, ButtonGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { manualLabels } from ".";
import { useObservation } from "./ObservationContext";

const PhaseButtons = () => {
  const { setNotes } = useObservation();
  const addNote = (label = "") => {
    setNotes((oldArray) => [
      {
        id: Date.now().toString(),
        label: label,
        timestamp: Date.now(),
      },
      ...oldArray,
    ]);
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
