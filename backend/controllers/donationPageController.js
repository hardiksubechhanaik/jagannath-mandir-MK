export const getDonationPage = async (req, res) => {
  res.json({
    note:
      "For donation amounts equal or larger than ₹50,000 please visit the mandir or contact the trust.",
    amounts: [
      { amount: 501, label: "Pooja & Prasad Seva" },
      { amount: 1101, label: "Festival Support" },
      { amount: 2101, label: "Mandir Maintenance" }
    ]
  });
};

export const createDonation = async (req, res) => {
  try {
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save donation" });
  }
};
