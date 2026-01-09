import DonationPage from "../models/DonationPage.js";
import Donation from "../models/Donation.js"; // 🔥 MISSING IMPORT

// GET donation page content (CMS)
export const getDonationPage = async (req, res) => {
  try {
    const page = await DonationPage.findOne();

    if (!page) {
      return res.json({
        note:
          "For donation amounts equal or larger than ₹50,000 please visit the mandir.",
        amounts: [
          { amount: 501, label: "Pooja & Prasad Seva" },
          { amount: 1101, label: "Festival Support" },
          { amount: 2101, label: "Mandir Maintenance" }
        ]
      });
    }

    res.json(page);
  } catch (error) {
    console.error("Donation page error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST donor details (FORM SUBMISSION)
export const createDonation = async (req, res) => {
  try {
    const donation = await Donation.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      amount: req.body.amount,
      mode: req.body.mode,
      transactionId: req.body.transactionId,
      comments: req.body.comments
    });

    res.status(201).json({
      success: true,
      message: "Donation saved successfully",
      donation
    });
  } catch (error) {
    console.error("Donation save error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save donation"
    });
  }
};
