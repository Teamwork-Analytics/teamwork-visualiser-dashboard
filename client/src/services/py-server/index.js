import axios from "axios";
import toast from "react-hot-toast";

const DOMAIN_NAME = process.env.REACT_APP_PYSERVER_IP;

const communicationAPI = axios.create({
  baseURL: `${DOMAIN_NAME}:5000`, //Change this if the port is being used.
});

communicationAPI.interceptors.request.use(
  (config) => {
    return {
      ...config,
      headers: {
        get: {
          "Access-Control-Allow-Origin": DOMAIN_NAME,
        },
      },
    };
  },
  (error) => Promise.reject(error)
);

communicationAPI.interceptors.response.use(
  function (response) {
    if (response.status === 401) {
      toast("You are not authorised!");
    }
    return response;
  },
  function (error) {
    console.log(error);
    let message = error.response.statusText;
    if (error.response.data !== undefined) {
      if (error.response.data.code === 403) return;
      message = error.response.data.message;
    }
    message += `Python service error:`;

    // toast.error(`${message} (${error})`); // disabled -> cause re-rendering bug. TODO: must fix the component state structure.
    // Do something with response error
    return Promise.reject(error);
  }
);

const getSNAdata = async (simulationId) => {
  return await communicationAPI.get(`/get_data?sessionId=${simulationId}`);
};

const getENAdata = async (body) => {
  const { simulationId, startTime, endTime } = body;
  return await communicationAPI.get(
    `/get_ena_data?sessionId=${simulationId}&start=${startTime}&end=${endTime}`
  );
};

const getTeamworkBarchart = async (body) => {
  const { simulationId, startTime, endTime } = body;
  return await communicationAPI.get(
    `/get_teamwork_prio_data?sessionId=${simulationId}&start=${startTime}&end=${endTime}`
  );
};

export { getSNAdata, getENAdata, getTeamworkBarchart };
