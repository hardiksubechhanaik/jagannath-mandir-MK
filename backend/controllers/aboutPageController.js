import AboutPage from "../models/AboutPage.js";

export const getAboutPage = async (req, res) => {
  try {
    const about = await AboutPage.findOne();
    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ message: "Failed to load about page" });
  }
};