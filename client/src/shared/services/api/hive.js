import { get } from "./index";

const HiveAPI = {
  single: (simId) => get(`hives/${simId}`),
  phases: (simId) => get(`hives/phases/${simId}`),
  isDataReady: (simId) => get(`hives/isReady/${simId}`),
};

export default HiveAPI;
