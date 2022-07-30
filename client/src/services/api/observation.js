import { get, put, post } from "./index";

const ObservationAPI = {
  single: (simId) => get(`observations/${simId}`),
  recordTime: (obsId) => put(`observations/simulation/${obsId}`),
  syncDeviceTime: (obsId) => put(`observations/device/${obsId}`),
  recordNote: (obsId) => put(`observations/note/${obsId}`),
};

export default ObservationAPI;
