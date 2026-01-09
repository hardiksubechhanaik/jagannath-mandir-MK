import Contact from "../models/Contact.js";

export const createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    res.status(201).json({
      message: "Contact form submitted successfully",
      contact
    });
  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({ message: "Failed to submit contact form" });
  }
};
