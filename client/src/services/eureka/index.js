import axios from "axios";
import toast from "react-hot-toast";

const DOMAIN_NAME = process.env.REACT_APP_EUREKA_IP;
const DOMAIN_NAME_SECOND_DEVICE = process.env.REACT_APP_AUDIO_IP;

const portStrategy = {
  video: `${DOMAIN_NAME}:7101`,
  pos: `${DOMAIN_NAME}:7201`,
  audio: `${DOMAIN_NAME_SECOND_DEVICE}:7501`,
};

const visualisationsApi = axios.create({
  baseURL: `${DOMAIN_NAME}:5050`,
});

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
      message += `${k} service error:`;

      toast.error(`${message} (${error})`);
      // Do something with response error
      return Promise.reject(error);
    }
  );
  eurekaAxiosStrategy.push({ axios: api, key: k });
});

const startBaselineAll = async (simulationId, action) => {
  eurekaAxiosStrategy[2]["axios"].get(`/audio/start-baseline/${simulationId}`);
  eurekaAxiosStrategy[0]["axios"].get(`/video/init/${simulationId}`);
};

const startAll = (simulationId) => {
  return Promise.all(
    eurekaAxiosStrategy.map(async (s) => {
      return await s["axios"].get(`/${s.key}/start/${simulationId}`);
    })
  );
};

const stopAll = async () => {
  return Promise.all(
    eurekaAxiosStrategy.map(async (s) => {
      return await s["axios"].get(`/${s.key}/stop`);
    })
  );
};

/**
 * FIXME: Need to be updated when the API is clearer
 */
const startDebriefAudio = async (simulationId) => {
  return await eurekaAxiosStrategy[2]["axios"].get(
    `/audio/start-debrief/${simulationId}`
  );
};

/**
 * FIXME:
 */
const stopDebriefAudio = () => {
  return eurekaAxiosStrategy[2]["axios"].get(`/audio/debrief-stop/`);
};

const processAllVisualisations = (simulationId) => {
  return visualisationsApi.get(`/audio-pos/${simulationId}`);
};

export {
  startBaselineAll,
  startAll,
  stopAll,
  startDebriefAudio,
  stopDebriefAudio,
  processAllVisualisations,
};
