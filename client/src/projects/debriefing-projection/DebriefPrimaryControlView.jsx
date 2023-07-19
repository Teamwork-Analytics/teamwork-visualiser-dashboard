import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { startDebriefAudio, stopDebriefAudio } from "../../services/eureka";
import { useDebriefing } from "./DebriefContext";

const DebriefPrimaryControlView = () => {
  const { simulationId } = useParams();
  const { setIsStarted } = useDebriefing();

  const styles = {
    wrapper: {
      fontSize: "3em",
      display: "flex",
      height: "17vh",
      flexDirection: "column",
      justifyContent: "center",
      rowGap: "1em",
    },
  };

  const sendRecordedTime = async (e) => {
    const opt = e.target.value;

    if (opt === "startTime") {
      const res = await startDebriefAudio(simulationId);

      if (res.status === 200) {
        toast.success(res.data);
        setIsStarted(true);
      }
    } else if (opt === "stopTime") {
      const res = await stopDebriefAudio(simulationId);
      if (res.status === 200) {
        toast.success(res.data);
        setIsStarted(false);
      }
    } else {
      return;
    }
  };

  return (
    <div style={styles.wrapper}>
      <Button
        variant="success"
        // disabled={observation.startTime !== null}
        value={"startTime"}
        onClick={sendRecordedTime}
      >
        Start Audio Recording
      </Button>
      <Button
        variant="dark"
        // disabled={observation.stopTime !== null}
        value={"stopTime"}
        onClick={sendRecordedTime}
      >
        Stop Audio Recording
      </Button>
      <ReactTooltip />
    </div>
  );
};

export default DebriefPrimaryControlView;
