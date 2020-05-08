import express from "express";
import { router as roomsRouter } from "./rooms";

export const router = express.Router();

router.get("/healthCheck", (req, res) => {
    res.sendStatus(200);
});

router.use("/rooms", roomsRouter);