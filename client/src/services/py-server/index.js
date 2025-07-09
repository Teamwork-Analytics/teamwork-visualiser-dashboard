import axios from "axios";
import toast from "react-hot-toast";

const DOMAIN_NAME = process.env.REACT_APP_PYSERVER_IP;
const PORT_NUMBER = process.env.REACT_APP_PYSERVER_PORT;
const PORT_NUMBER_VISUALISER = process.env.REACT_APP_PYSERVER_PORT_VISUALISER;


const communicationAPI = axios.create({
  baseURL: `${DOMAIN_NAME}:${PORT_NUMBER}`, //Change this if the port is being used.
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
      toast.error("You are not authorised!");
    }
    return response;
  },
  function (error) {
    console.log(error);
    let message = error.response.statusText;
    if (error.response.data !== undefined) {
      if (error.response.data.code === 403) return;
      message = error.response.data;
    }
    message += ` - Python service error:`;

    // toast.error(`${message} (${error}):`); // disabled -> cause re-rendering bug. TODO: must fix the component state structure.
    console.error(`${message} (${error}):`); // disabled -> cause re-rendering bug. TODO: must fix the component state structure.
    // Do something with response error
    // return Promise.reject(message);
  }
);

const getSNAdata = async (body) => {
  const { simulationId, startTime, endTime, docEnterTime } = body;

  return await communicationAPI.get(
    `/get_data?sessionId=${simulationId}&start=${startTime}&end=${endTime}&doc_enter=${docEnterTime}`
  );
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

const processAllVisualisations = async (simulationId) => {
  return await communicationAPI.get(`/generate_viz?sessionId=${simulationId}`);
};

const processCommBehaviourViz = async (simulationId) => {
  return await communicationAPI.get(
    `/generate_ena_viz?sessionId=${simulationId}`
  );
};

const processVideoTranscoding = async (simulationId) => {
  return await communicationAPI.get(
    `/transcode_video?sessionId=${simulationId}`
  );
};


const startDepthCamera = async(sessionId) => {
  return await communicationAPI.post(`/cameras/start?sessionId=${sessionId}`)
}

const stopDepthCamera = async() => {
  return await communicationAPI.post(`/cameras/stop`)
}



export {
  getSNAdata,
  getENAdata,
  getTeamworkBarchart,
  processAllVisualisations,
  processCommBehaviourViz,
  processVideoTranscoding,
  startDepthCamera,
  stopDepthCamera
};
