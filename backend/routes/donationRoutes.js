import express from "express";
import {
  getDonationPage,
  createDonation
} from "../controllers/donationController.js";

const router = express.Router();

router.get("/donation-page", getDonationPage);
router.post("/donations", createDonation);

export default router;
