import axios from "axios";

export const baseURL = "localhost:8080";

export const api = axios.create({
    baseURL: `http://${baseURL}`
});
