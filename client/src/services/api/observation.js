import { get, patch, post, destroy } from "./index";

const ObservationAPI = {
  single: (simId) => get(`observations/${simId}`),
  recordSimTime: (obsId, data) =>
    patch(`observations/simulation/${obsId}`, data),
  syncDeviceTime: (obsId, data) => patch(`observations/device/${obsId}`, data),
  recordNote: (obsId, data) => post(`observations/note/${obsId}`, data),
  updateNote: (obsId, data) => patch(`observations/note/${obsId}`, data),

  deleteNote: (obsId, noteId) =>
    destroy(`observations/note/${obsId}/${noteId}`),
  resetObservation: (obsId) => patch(`observations/reset/${obsId}`),
};

export default ObservationAPI;
