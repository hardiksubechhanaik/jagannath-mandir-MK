import express from "express";
import { getHomeContent } from "../controllers/homeContentController.js";

const router = express.Router();

router.get("/home-content", getHomeContent);

export default router;