import { communicationAPI } from "./indexVisualiser";

const HeartRates = {
  get_by_id_and_time: async (params) => {
     const { simulationId, startTime, endTime } = params;
     return await communicationAPI.get(`get_heart_rate_data?sessionId=${simulationId}&start=${startTime}&end=${endTime}`);
  },
}

export { HeartRates };