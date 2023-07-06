import { useParams } from "react-router-dom";
import { Image } from "react-bootstrap";

const TeamworkBarchart = () => {
  const { simulationId } = useParams();

  const csvUrl = process.env.PUBLIC_URL + "/api/visualisations/" + simulationId;

  return <Image width={"100%"} src={`${csvUrl}/teamwork-barchart`} />;
};

export default TeamworkBarchart;
