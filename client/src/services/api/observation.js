import { get, patch } from "./index";

const ObservationAPI = {
  single: (simId) => get(`observations/${simId}`),
  recordSimTime: (obsId, data) =>
    patch(`observations/simulation/${obsId}`, data),
  syncDeviceTime: (obsId, data) => patch(`observations/device/${obsId}`, data),
  recordNote: (obsId, data) => patch(`observations/note/${obsId}`, data),
};

export default ObservationAPI;
