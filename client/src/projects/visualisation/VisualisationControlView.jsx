import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { processAllVisualisations } from "../../services/eureka";

const VisualisationControlView = () => {
  const { simulationId } = useParams();
  const handleClick = () => {
    processAllVisualisations(simulationId);
  };
  return (
    <div>
      <Button variant="secondary" value={"baselineTime"} onClick={handleClick}>
        Generate All Visualisations
      </Button>
    </div>
  );
};

export default VisualisationControlView;
