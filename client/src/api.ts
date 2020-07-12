import axios from "axios";

export const baseURL = process.env.NODE_ENV === "production"
    ? "greg.noonan.be"
    : "localhost:8080";

const protocol = process.env.NODE_ENV === "production"
    ? "https"
    : "http";

export const api = axios.create({
    baseURL: `${protocol}://${baseURL}`
});
