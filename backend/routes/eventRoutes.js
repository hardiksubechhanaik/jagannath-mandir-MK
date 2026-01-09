import express from "express";
import { getAllEvents, getUpcomingEvents } from "../controllers/eventController.js";

const router = express.Router();

router.get("/events", getAllEvents);

router.get("/upcoming", getUpcomingEvents);

export default router;
