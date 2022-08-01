import { get } from "./index";

const HiveAPI = {
  single: (simId) => get(`hives/${simId}`),
  phases: (simId) => get(`hives/phases/${simId}`),
};

export default HiveAPI;
