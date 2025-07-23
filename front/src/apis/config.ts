const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const API_ENDPOINT = {
  AUTH: `${SERVER_URL}/auth`,
  USER: `${SERVER_URL}/user`,
  CALL: `${SERVER_URL}/call`,
};

export { SERVER_URL, API_ENDPOINT };
