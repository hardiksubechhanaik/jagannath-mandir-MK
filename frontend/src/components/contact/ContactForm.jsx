import { useState } from "react";
import FormInput from "../common/FormInput";
import FormTextarea from "../common/FormTextarea";
import FormButton from "../common/FormButton";
import API from "../../../config/api";

const ContactUsForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    company: "",
    email: "",
    phone: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/contact`,
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
        designation: "",
        company: "",
        email: "",
        phone: "",
        message: ""
      });
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-orange-50 py-20 text-center px-6">
      <h3 className="text-3xl font-bold text-orange-600 mb-6">
        Contact Us
      </h3>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        {success ? (
          <p className="text-green-600 font-semibold">
            Thank you 🙏 We will contact you soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
            <FormInput name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} />
            <FormInput name="company" placeholder="Company" value={formData.company} onChange={handleChange} />
            <FormInput type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
            <FormInput name="phone" placeholder="Contact No." value={formData.phone} onChange={handleChange} />
            <FormTextarea name="message" placeholder="Your Message / Comment / Suggestions" value={formData.message} onChange={handleChange} />
            <FormButton text={loading ? "Submitting..." : "Submit"} disabled={loading} />
          </form>
        )}
      </div>
    </section>
  );
};

export default ContactUsForm;
