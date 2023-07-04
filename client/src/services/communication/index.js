import axios from "axios";
import toast from "react-hot-toast";

const DOMAIN_NAME = "http://localhost";

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
    message += `Communication service error:`;

    toast.error(`${message} (${error})`);
    // Do something with response error
    return Promise.reject(error);
  }
);

const getSNAdata = (simulationId) => {
  return communicationAPI.get(`/get_data?sessionId=${simulationId}`);
};

const getENAdata = (simulationId) => {
  return communicationAPI.get(`/get_ena_data?sessionId=${simulationId}`);
};

export { getSNAdata, getENAdata };
