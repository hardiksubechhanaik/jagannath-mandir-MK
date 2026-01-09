import { useState } from "react";
import FormInput from "../common/FormInput";
import FormButton from "../common/FormButton";
import FormTextarea from "../common/FormTextarea";
import API from "../../../config/api";

const DonorDetails = ({ amount }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    amount: amount || "",
    mode: "",
    transactionId: "",
    comments: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync selected amount from tiles
  useState(() => {
    if (amount) {
      setFormData(prev => ({ ...prev, amount }));
    }
  }, [amount]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/donations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      if (!res.ok) throw new Error("Failed");

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        amount: amount || "",
        mode: "",
        transactionId: "",
        comments: ""
      });
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-orange-50 py-16 text-center px-6">
      <h3 className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">
        Donor Details
      </h3>

      <p className="text-gray-700 mb-8">
        <strong>Please note:</strong> Fill the form only if you have paid through
        the links / bank details / QR provided on the website.
      </p>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        {success ? (
          <p className="text-green-600 font-semibold">
            Thank you 🙏 Your donation details have been recorded.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <FormInput
              type="email"
              name="email"
              placeholder="Email ID"
              value={formData.email}
              onChange={handleChange}
            />

            <FormInput
              name="phone"
              placeholder="Mobile Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <FormInput
              name="amount"
              placeholder="Donation Amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <FormInput
              name="mode"
              placeholder="Donation Mode (UPI / Bank / Cash)"
              value={formData.mode}
              onChange={handleChange}
            />

            <FormInput
              name="transactionId"
              placeholder="Transaction ID / UTR No."
              value={formData.transactionId}
              onChange={handleChange}
            />

            <FormTextarea
              name="comments"
              placeholder="Comments..."
              value={formData.comments}
              onChange={handleChange}
            />

            <FormButton
              text={loading ? "Submitting..." : "Proceed to Donate"}
              disabled={loading}
            />
          </form>
        )}
      </div>
    </section>
  );
};

export default DonorDetails;
