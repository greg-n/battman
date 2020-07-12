import axios from "axios";

export const baseURL = process.env.NODE_ENV === "production"
    ? "battman.herokuapp.com"
    : "localhost:8080";

const httpProtocol = process.env.NODE_ENV === "production"
    ? "https"
    : "http";

export const wsProtocol = process.env.NODE_ENV === "production"
    ? "wss"
    : "ws";

export const api = axios.create({
    baseURL: `${httpProtocol}://${baseURL}`
});
