import * as controller from "../../controllers/http/rooms";
import express from "express";

export const router = express.Router();

router.get("/:roomName", controller.get.room);
router.post("/:roomName", controller.post.room);