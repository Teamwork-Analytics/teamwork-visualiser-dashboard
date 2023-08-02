import { get, put, post } from "./index";

const SimulationSessionAPI = {
  index: () => get(`simulations/`),
  single: (id) => get(`simulations/${id}`),
  create: (id, data) => post(`$simulations/${id}`, data),
  update: (id, data) => put(`$simulations/${id}`, data),
  isReady: (id) => get(`visualisations/isReady/${id}`),
};

export default SimulationSessionAPI;
