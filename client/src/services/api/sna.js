import { get } from "./index";

const CommunicationAPI = {
  snaSingle: (simId) => get(`communications/sna/${simId}`),
  enaSingle: (simId) => get(`communications/ena/${simId}`),
};

export default CommunicationAPI;
