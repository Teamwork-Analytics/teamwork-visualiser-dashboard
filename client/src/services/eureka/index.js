import axios from "axios";
import toast from "react-hot-toast";

const DOMAIN_NAME = "http://localhost";

const portStrategy = {
  video: `${DOMAIN_NAME}:7101`,
  pos: `${DOMAIN_NAME}:7201`,
  bio: `${DOMAIN_NAME}:7301`,
  audio: `${DOMAIN_NAME}:7501`,
};

let eurekaAxiosStrategy = []; // each object = {axios, key}
Object.keys(portStrategy).forEach((k) => {
  const api = axios.create({
    baseURL: portStrategy[k],
  });

  api.interceptors.request.use(
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

  api.interceptors.response.use(
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

      toast.error(`${message} (${error})`);
      // Do something with response error
      return Promise.reject(error);
    }
  );
  eurekaAxiosStrategy.push({ axios: api, key: k });
});

const startAll = (simulationId) => {
  return Promise.all(
    eurekaAxiosStrategy.forEach(async (s) => {
      await s["axios"].get(`/${s.key}/start/${simulationId}`);
    })
  );
};

const stopAll = (simulationId) => {
  return Promise.all(
    eurekaAxiosStrategy.forEach(async (s) => {
      await s["axios"].get(`/${s.key}/stop/${simulationId}`);
    })
  );
};

export { startAll, stopAll };
