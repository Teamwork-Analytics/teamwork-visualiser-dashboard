/**
 * This file exports a custom axios client for our own API server which handles all requests to the server.
 *
 * @note: If this React client is being served by a reverse proxy, the localServerUrl is used as a *relative*
 * URL to point to the "/api" route, and the reverse proxy is expected to proxy the request to the API server.
 * see: https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_URL#absolute_urls_vs_relative_urls
 */
import axios from "axios";
import toast from "react-hot-toast";

const usingRp = true;
const localServerUrl = usingRp ? "/api" : "http://localhost:5001";
const api = axios.create({
  baseURL: localServerUrl,
  withCredentials: false,
});

// api.interceptors.request.use(
//   (config) => {
//     return {
//       ...config,
//       // headers: {}
//     };
//   },
//   (error) => Promise.reject(error)
// );

// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    if (response.status === 401) {
      toast("You are not authorised!");
    }
    return response;
  },
  function (error) {
    let message = error.response.statusText;
    if (error.response.data.code === 403) return;
    console.log(error.response.data);
    if (error.response.data.message) {
      message = error.response.data.message;
    }
    toast.error(`${message} (${error.response.status})`);
    // Do something with response error
    return Promise.reject(error);
  }
);

const { get, post, put, delete: destroy } = api;
const API_PATH = "/app";
const AUTH_PATH = "/auth";

export { get, post, put, destroy, API_PATH, AUTH_PATH };
