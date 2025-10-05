import { get } from "./index";

const HeartRates = {
  index: (simId) => get(`heart-rates/${simId}`)
};

export default HeartRates;