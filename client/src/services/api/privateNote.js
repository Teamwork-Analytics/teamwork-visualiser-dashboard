import { get, patch } from "./index";

const PrivateNoteAPI = {
  // Function to get a single private note by simulation id
  get: (simId) => get(`privateNotes/${simId}`),
  // Function to update a private note by simulation id
  update: (simId, data) => patch(`privateNotes/${simId}`, data),
};

export default PrivateNoteAPI;
