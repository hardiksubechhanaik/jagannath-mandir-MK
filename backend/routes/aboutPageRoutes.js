import express from "express";
import { getAboutPage } from "../controllers/aboutPageController.js";

const router = express.Router();

router.get("/about-page", getAboutPage);

export default router;
