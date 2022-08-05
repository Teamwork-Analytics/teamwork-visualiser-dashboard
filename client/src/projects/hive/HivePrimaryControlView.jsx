import { Image } from "react-bootstrap";
import LegendImage from "./legend.png";
const HivePrimaryControlView = () => {
  return (
    <div style={{ width: "16vw", display: "flex", justifyContent: "center" }}>
      <Image src={LegendImage} fluid={true} />
    </div>
  );
};

export default HivePrimaryControlView;
