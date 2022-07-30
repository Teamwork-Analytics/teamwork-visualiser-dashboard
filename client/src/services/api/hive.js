import { get } from "./index";

const HiveAPI = {
  single: (id) => get(`hives/${id}`),
};

export default HiveAPI;
