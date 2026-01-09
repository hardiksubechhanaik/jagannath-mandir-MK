import express from "express";
import { getTimings } from "../controllers/timingController.js";

const router = express.Router();

router.get("/timings", getTimings);

export default router;