import axios from "axios";

const api = axios.create({

  baseURL: "https://floodwatch-sl.onrender.com"

});

export default api;