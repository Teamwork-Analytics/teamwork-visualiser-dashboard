import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { processAllVisualisations } from "../../services/eureka";

const VisualisationControlView = () => {
  const { simulationId } = useParams();
  return <div></div>;
};

export default VisualisationControlView;
