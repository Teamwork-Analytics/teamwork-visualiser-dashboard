import { Image } from "react-bootstrap";
import LegendImage from "./legend.png";
const HiveLegendView = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Image src={LegendImage} fluid={true} />
    </div>
  );
};

export default HiveLegendView;
