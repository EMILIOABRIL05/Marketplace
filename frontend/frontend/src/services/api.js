import axios from "axios";

const api = axios.create({
  baseURL: "https://overfeminine-armandina-snowless.ngrok-free.dev/api"
});

export default api;