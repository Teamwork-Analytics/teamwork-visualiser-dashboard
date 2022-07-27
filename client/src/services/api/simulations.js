import { get, put, post } from "./index";

const SimulationSessionsAPI = {
  index: () => get(`sessions/`),
  single: (id) => get(`sessions/${id}`),
  create: (id, data) => post(`$sessions/${id}`, data),
  update: (id, data) => put(`$sessions/${id}`, data),
  delete: (id) => get(`sessions`),
};

export default SimulationSessionsAPI;
